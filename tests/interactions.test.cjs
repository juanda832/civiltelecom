const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "../assets/js/main.js"), "utf8");
const app = vm.createContext({});
vm.runInContext(source, app);

const validQuery = {
  name: "Equipo de prueba",
  email: "pruebas@example.com",
  subject: "Evaluacion de fibra",
  message: "Ampliacion de una ruta de fibra optica."
};

test("a complete query has no validation errors", () => {
  assert.equal(Object.keys(app.validateContactValues(validQuery)).length, 0);
});

test("required fields reject empty or whitespace-only values", () => {
  assert.deepEqual(Object.keys(app.validateContactValues({})), ["name", "email", "subject", "message"]);
  assert.equal(Object.keys(app.validateContactValues({name: "  ", email: " ", subject: "    ", message: "            "})).length, 4);
});

test("email and minimum lengths are checked independently", () => {
  for (const email of ["sin-arroba", "a@@empresa.com", "a@empresa", "a b@empresa.com"]) {
    assert.deepEqual(Object.keys(app.validateContactValues({...validQuery, email})), ["email"]);
  }
  assert.deepEqual(Object.keys(app.validateContactValues({...validQuery, message: "muy corto"})), ["message"]);
});

test("correcting a field removes its error without hiding unrelated errors", () => {
  const invalid = {...validQuery, name: "", email: "no-valido"};
  assert.equal(Object.keys(app.validateContactValues(invalid)).length, 2);
  assert.deepEqual(Object.keys(app.validateContactValues({...invalid, name: "Equipo"})), ["email"]);
});

test("field errors preserve existing accessible hints", () => {
  const attributes = {"aria-describedby": "email-hint"};
  const control = {
    id: "email", name: "email",
    getAttribute: (name) => attributes[name] || null,
    setAttribute: (name, value) => { attributes[name] = value; },
    removeAttribute: (name) => { delete attributes[name]; }
  };
  const error = {};
  const field = {classList: {toggle() {}}, querySelector: (selector) => selector === "[data-error-for]" ? error : control};
  const form = {querySelectorAll: () => [field]};
  app.showFormErrors(form, {email: "Correo invalido"});
  assert.equal(attributes["aria-describedby"], "email-hint email-error");
  app.showFormErrors(form, {});
  assert.equal(attributes["aria-describedby"], "email-hint");
  assert.equal(attributes["aria-invalid"], "false");
  assert.equal(error.textContent, "");
});

test("dialog focus returns inside after a dynamic control is replaced", () => {
  let focused;
  let prevented = false;
  const first = {focus: () => { focused = "first"; }, getClientRects: () => [{}]};
  const last = {focus: () => { focused = "last"; }, getClientRects: () => [{}]};
  const container = {querySelectorAll: () => [first, last], contains: () => false};
  app.document = {activeElement: {}};
  const event = {key: "Tab", shiftKey: false, preventDefault: () => { prevented = true; }};
  app.trapFocus(event, container);
  assert.equal(focused, "first");
  assert.equal(prevented, true);
  app.trapFocus({...event, shiftKey: true}, container);
  assert.equal(focused, "last");
  delete app.document;
});

test("Mateo prioritizes an outage over a generic fiber question", () => {
  assert.match(app.getChatbotAnswer("Corte urgente de fibra optica"), /no recibe emergencias/);
  assert.match(app.getChatbotAnswer("Proyecto Roboré"), /San José/);
  assert.match(app.getChatbotAnswer("Horario de atención"), /por confirmar/);
});

test("manual video pause survives tab changes and reduced motion is respected", () => {
  const videoEvents = {};
  const documentEvents = {};
  const toggleEvents = {};
  const sourceEvents = {};
  let motionChanged;
  const video = {
    paused: true,
    pause() { this.paused = true; videoEvents.pause?.(); },
    play() { this.paused = false; videoEvents.play?.(); return Promise.resolve(); },
    addEventListener: (name, callback) => { videoEvents[name] = callback; },
    querySelector: () => ({addEventListener: (name, callback) => { sourceEvents[name] = callback; }})
  };
  const toggle = {
    dataset: {}, setAttribute() {},
    addEventListener: (name, callback) => { toggleEvents[name] = callback; }
  };
  const motion = {matches: false, addEventListener: (_, callback) => { motionChanged = callback; }};
  app.window = {matchMedia: () => motion};
  app.document = {
    hidden: false,
    querySelector: (selector) => selector === ".hero-video" ? video : toggle,
    addEventListener: (name, callback) => { documentEvents[name] = callback; }
  };
  app.initHeroVideo();
  assert.equal(video.paused, false);
  toggleEvents.click();
  app.document.hidden = true;
  documentEvents.visibilitychange();
  app.document.hidden = false;
  documentEvents.visibilitychange();
  assert.equal(video.paused, true);
  toggleEvents.click();
  assert.equal(video.paused, false);
  motion.matches = true;
  motionChanged();
  assert.equal(video.paused, true);
  sourceEvents.error();
  assert.equal(video.hidden, true);
  assert.equal(toggle.hidden, true);
  delete app.document;
  delete app.window;
});
