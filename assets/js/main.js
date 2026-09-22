/*
  CIVILTELECOM S.R.L. shared interactions.
  This file keeps the site lightweight: no frameworks, no external dependencies.
*/

function initSite() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  initPageChrome(currentPage);

  const navLinks = document.querySelectorAll(".nav-menu a");

  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (href === currentPage) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
  });

  const navToggle = document.querySelector("[data-nav-toggle]");
  const navMenu = document.querySelector("[data-nav-menu]");

  if (navToggle && navMenu) {
    const setMenuOpen = (open) => {
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
      navMenu.classList.toggle("is-open", open);
      document.body.classList.toggle("nav-open", open);
    };
    navToggle.addEventListener("click", () => {
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";
      setMenuOpen(!isOpen);
    });

    navMenu.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        setMenuOpen(false);
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") {
        setMenuOpen(false);
        navToggle.focus();
      }
    });
    document.addEventListener("click", (event) => {
      if (!event.target.closest(".navbar")) {
        setMenuOpen(false);
      }
    });
    window.matchMedia("(min-width: 941px)").addEventListener("change", () => {
      setMenuOpen(false);
    });
    document.querySelector(".navbar").addEventListener("focusout", () => {
      requestAnimationFrame(() => {
        if (!document.activeElement.closest(".navbar")) setMenuOpen(false);
      });
    });
  }

  initHeroVideo();
  initSmoothAnchors();
  initScrollEnhancements();
  initServiceFilters();
  initBranchExplorer();
  initProposalTool();
  initProjectModals();
  initContactForm();
  initChatbot();
}

// Keep initialization separate so the validation helpers can be tested without a browser.
if (typeof document !== "undefined") initSite();

function initHeroVideo() {
  const video = document.querySelector(".hero-video");
  const toggle = document.querySelector("[data-video-toggle]");
  if (!video || !toggle) return;
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let pausedByUser = motion.matches;
  const updateControl = () => {
    const label = video.paused ? "Reproducir video de fondo" : "Pausar video de fondo";
    toggle.setAttribute("aria-label", label);
    toggle.title = label;
    toggle.dataset.paused = String(video.paused);
  };
  const syncVideo = () => {
    if (pausedByUser || document.hidden) video.pause();
    else video.play().catch(updateControl);
    updateControl();
  };
  toggle.hidden = false;
  toggle.addEventListener("click", () => {
    pausedByUser = !video.paused;
    syncVideo();
  });
  motion.addEventListener("change", () => {
    pausedByUser = motion.matches;
    syncVideo();
  });
  document.addEventListener("visibilitychange", syncVideo);
  video.addEventListener("play", updateControl);
  video.addEventListener("pause", updateControl);
  const showPoster = () => { video.hidden = true; toggle.hidden = true; };
  video.addEventListener("error", showPoster);
  video.querySelector("source")?.addEventListener("error", showPoster);
  syncVideo();
}

function initPageChrome(currentPage) {
  const pageName = currentPage.replace(".html", "") || "index";
  document.body.dataset.page = pageName;
  document.body.classList.add(`page-${pageName}`);

  document.querySelectorAll(".floating-contact, .conversion-dock").forEach((element) => element.remove());
  const header = document.querySelector(".site-header");
  if (header && "ResizeObserver" in window) {
    new ResizeObserver(() => {
      document.documentElement.style.setProperty("--header-offset", `${header.offsetHeight}px`);
    }).observe(header);
  }
}

function initSmoothAnchors() {
  document.addEventListener("click", (event) => {
      const link = event.target.closest('a[href^="#"]:not([href="#"])');
      if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const rawTarget = link.getAttribute("href");
      if (!rawTarget || rawTarget.length < 2) return;

      let targetId;
      try { targetId = decodeURIComponent(rawTarget.slice(1)); } catch { return; }
      const target = document.getElementById(targetId);
      if (!target) return;

      event.preventDefault();
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: target.matches("input, textarea, select") ? "center" : "start"
      });

      if (!target.matches("input, textarea, select, button, a")) target.tabIndex = -1;
      target.focus({ preventScroll: true });

      if (window.history && window.history.pushState) {
        try { window.history.replaceState(null, "", rawTarget); } catch { /* file:// may restrict history. */ }
      }
  });
}

function initScrollEnhancements() {
  const header = document.querySelector("[data-site-header]");
  const progress = document.createElement("span");
  const backToTop = document.createElement("button");
  const revealItems = document.querySelectorAll(
    ".service-card, .branch-card, .image-card, .project-card, .team-card, .timeline li, .org-branches article, .coverage-grid article, .proposal-path article"
  );
  const counters = document.querySelectorAll(".counter[data-target]");

  progress.className = "scroll-progress";
  progress.setAttribute("aria-hidden", "true");
  document.body.prepend(progress);

  backToTop.className = "back-to-top";
  backToTop.type = "button";
  backToTop.textContent = "↑";
  backToTop.title = "Volver al inicio";
  backToTop.tabIndex = -1;
  backToTop.setAttribute("aria-label", "Volver al inicio");
  document.body.appendChild(backToTop);

  function updateScrollState() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
    progress.style.transform = `scaleX(${Math.min(Math.max(ratio, 0), 1)})`;

    if (header) {
      header.classList.toggle("is-scrolled", window.scrollY > 24);
    }

    backToTop.classList.toggle("is-visible", window.scrollY > 520);
    backToTop.tabIndex = window.scrollY > 520 ? 0 : -1;
  }

  backToTop.addEventListener("click", () => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
    document.querySelector(".navbar .brand")?.focus({ preventScroll: true });
  });

  window.addEventListener("scroll", updateScrollState, { passive: true });
  updateScrollState();

  revealItems.forEach((item) => item.classList.add("reveal"));

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0, rootMargin: "0px 0px 24px 0px" }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  if ("IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.6 }
    );

    counters.forEach((counter) => counterObserver.observe(counter));
  } else {
    counters.forEach(animateCounter);
  }
}

function animateCounter(counter) {
  const target = Number(counter.dataset.target);
  const suffix = counter.dataset.suffix || "";
  if (!Number.isFinite(target)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    counter.textContent = `${target}${suffix}`;
    return;
  }

  const duration = 900;
  const startTime = performance.now();
  const startValue = target > 100 ? target - 80 : 0;

  function tick(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(startValue + (target - startValue) * eased);
    counter.textContent = `${value}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  }

  requestAnimationFrame(tick);
}

function initServiceFilters() {
  const controls = document.querySelectorAll("[data-service-filter]");
  const cards = document.querySelectorAll("[data-service-category]");
  if (!controls.length || !cards.length) return;

  controls.forEach((control) => {
    control.setAttribute("aria-pressed", String(control.classList.contains("is-active")));

    control.addEventListener("click", () => {
      const filter = control.dataset.serviceFilter;

      controls.forEach((button) => {
        const isActive = button === control;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
      });

      cards.forEach((card) => {
        const shouldShow = filter === "all" || card.dataset.serviceCategory === filter;
        card.classList.toggle("is-hidden", !shouldShow);
      });
    });
  });
}

function initBranchExplorer() {
  const explorer = document.querySelector("[data-branch-explorer]");
  const cards = document.querySelectorAll("[data-branch-card]");
  if (!explorer || !cards.length) return;

  const controls = explorer.querySelectorAll("[data-branch-filter]");
  const count = explorer.querySelector("[data-branch-count]");
  const summary = explorer.querySelector("[data-branch-summary]");
  const detailPanel = document.querySelector("[data-branch-detail-panel]");
  const detailCode = document.querySelector("[data-branch-detail-code]");
  const detailTitle = document.querySelector("[data-branch-detail-title]");
  const detailText = document.querySelector("[data-branch-detail-text]");
  const detailProof = document.querySelector("[data-branch-detail-proof]");
  const summaries = {
    all: "Mapa completo de capacidades para contrataciones civiles y telecom.",
    civil: "Ramas enfocadas en obra civil, seguridad y preparación de infraestructura.",
    red: "Ramas enfocadas en fibra óptica, continuidad y mantenimiento de red.",
    antenas: "Ramas enfocadas en torres, radio bases e inspección de sitios.",
    gestion: "Ramas enfocadas en supervisión, logística, documentos y diagnóstico.",
    comunidad: "Ramas enfocadas en impacto social y coordinación local."
  };

  function updateDetail(card) {
    cards.forEach((item) => {
      const isActive = item === card;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });

    if (!detailPanel || !card) return;
    detailCode.textContent = card.dataset.branchCode || "";
    detailTitle.textContent = card.dataset.branchTitle || card.querySelector("h3")?.textContent || "";
    detailText.textContent = card.dataset.branchDetail || card.querySelector("p")?.textContent || "";
    detailProof.textContent = card.dataset.branchProof || "Rama disponible para evaluación según alcance del proyecto.";
  }

  function applyFilter(filter) {
    let visibleCards = [];

    controls.forEach((button) => {
      const isActive = button.dataset.branchFilter === filter;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    cards.forEach((card) => {
      const shouldShow = filter === "all" || card.dataset.branchCategory === filter;
      card.hidden = !shouldShow;
      if (shouldShow) visibleCards.push(card);
    });

    if (count) {
      count.textContent = `${visibleCards.length} ${visibleCards.length === 1 ? "rama" : "ramas"}`;
    }

    if (summary) {
      summary.textContent = summaries[filter] || summaries.all;
    }

    updateDetail(visibleCards[0]);
  }

  cards.forEach((card) => {
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-pressed", "false");
    card.setAttribute("aria-label", `Ver detalle de ${card.dataset.branchTitle || card.querySelector("h3")?.textContent || "esta rama"}`);

    card.addEventListener("click", () => updateDetail(card));
    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      updateDetail(card);
    });
  });

  controls.forEach((control) => {
    control.setAttribute("aria-pressed", String(control.classList.contains("is-active")));
    control.addEventListener("click", () => applyFilter(control.dataset.branchFilter || "all"));
  });

  applyFilter("all");
}

function initProposalTool() {
  const tool = document.querySelector("[data-proposal-tool]");
  if (!tool) return;

  const result = tool.querySelector("[data-proposal-result]");
  const projectCopy = {
    fibra: "Para fibra óptica conviene preparar ruta estimada, puntos de inicio/fin, disponibilidad de ductos o postes, cantidad aproximada de empalmes y necesidad de pruebas.",
    civil: "Para obra civil telecom conviene preparar planos, permisos, tipo de terreno, ubicación de cámaras, cruces, ductos, bases y restricciones de acceso.",
    antenas: "Para antenas y radio bases conviene preparar altura de torre, tipo de estructura, equipos a instalar, energía, acceso, seguridad y ventana de trabajo.",
    mantenimiento: "Para mantenimiento conviene preparar síntomas, ubicación exacta, historial de intervenciones, criticidad del servicio y fotos del punto afectado."
  };
  const zoneCopy = {
    urbana: "En zona urbana se debe coordinar tránsito, vecinos, horarios, permisos y señalización.",
    rural: "En ruta rural o interurbana se debe revisar accesos, distancias, materiales, transporte y condiciones climáticas.",
    altura: "En sitios de altura se debe priorizar seguridad, arneses, clima, permisos de acceso y personal especializado.",
    nacional: "En proyectos multipunto se recomienda agrupar ubicaciones por departamento, prioridad y disponibilidad de recursos."
  };
  const urgencyCopy = {
    planificado: "La recomendación es iniciar con relevamiento y cronograma técnico.",
    rapido: "La recomendación es enviar ubicación, fotos y alcance mínimo para una respuesta inicial más ágil.",
    critico: "La recomendación es marcar continuidad crítica y detallar impacto operativo para priorizar la evaluación."
  };

  tool.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(tool);
    const type = normalizeText(data.get("projectType"));
    const zone = normalizeText(data.get("projectZone"));
    const urgency = normalizeText(data.get("projectUrgency"));

    result.innerHTML = `
      <strong>Guía recomendada para tu solicitud</strong>
      <span>${projectCopy[type] || projectCopy.fibra}</span>
      <span>${zoneCopy[zone] || zoneCopy.urbana}</span>
      <span>${urgencyCopy[urgency] || urgencyCopy.planificado}</span>
      <a href="contacto.html?servicio=${encodeURIComponent(type)}#consulta">Preparar consulta con este servicio</a>
    `;
  });
}

function setPageInert(inert) {
  document.querySelectorAll("main, .site-header, .site-footer, .back-to-top").forEach((element) => {
    element.inert = inert;
  });
}

function trapFocus(event, container) {
  if (event.key !== "Tab") return;
  const controls = Array.from(container.querySelectorAll('a[href], button, input, select, textarea, [tabindex="0"]'))
    .filter((element) => !element.disabled && element.getClientRects().length);
  const first = controls[0];
  const last = controls[controls.length - 1];
  if (!first) return;
  if (!container.contains(document.activeElement)) {
    event.preventDefault();
    (event.shiftKey ? last : first).focus();
  } else if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function initProjectModals() {
  const triggers = document.querySelectorAll("[data-modal-target]");
  const closeButtons = document.querySelectorAll("[data-modal-close]");
  let lastFocusedElement = null;
  document.querySelectorAll(".modal").forEach((modal) => document.body.appendChild(modal));

  function openModal(modal) {
    if (!modal) return;
    lastFocusedElement = document.activeElement;
    modal.hidden = false;
    document.body.classList.add("modal-open");
    setPageInert(true);
    const chatbot = document.querySelector("[data-chatbot]");
    if (chatbot) chatbot.inert = true;
    const closeButton = modal.querySelector("button[data-modal-close]");
    if (closeButton) closeButton.focus();
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove("modal-open");
    setPageInert(false);
    const chatbot = document.querySelector("[data-chatbot]");
    if (chatbot) chatbot.inert = false;
    if (lastFocusedElement) lastFocusedElement.focus();
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      openModal(document.getElementById(trigger.dataset.modalTarget));
    });
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      closeModal(button.closest(".modal"));
    });
  });

  document.addEventListener("keydown", (event) => {
    const openModalElement = document.querySelector(".modal:not([hidden])");
    if (!openModalElement) return;
    if (event.key === "Escape") closeModal(openModalElement);
    else trapFocus(event, openModalElement);
  });
}

function initContactForm() {
  const form = document.querySelector("[data-contact-form]");
  if (!form) return;

  const status = form.querySelector("[data-form-status]");
  const preview = form.querySelector("[data-query-preview]");
  const output = form.querySelector("[data-query-text]");
  const clearPrompt = form.querySelector("[data-clear-confirm]");
  const clearButton = form.querySelector("[data-clear-draft]");
  const cancelClear = form.querySelector("[data-cancel-clear]");
  const keys = ["company", "timeline", "name", "email", "service", "location", "subject", "message"];
  let submitted = false;
  const readValues = () => Object.fromEntries(keys.map((key) => [key, form.elements[key].value.trim()]));
  const saveDraft = () => {
    try {
      sessionStorage.setItem("civiltelecom-query", JSON.stringify(Object.fromEntries(keys.map((key) => [key, form.elements[key].value]))));
    } catch { /* Retain values in the form if storage is disabled. */ }
  };
  const selectedService = new URLSearchParams(location.search).get("servicio");
  try {
    const saved = JSON.parse(sessionStorage.getItem("civiltelecom-query") || "null");
    if (saved && typeof saved === "object") keys.forEach((key) => {
      if (typeof saved[key] === "string") form.elements[key].value = saved[key];
    });
  } catch { /* The form also works when browser storage is unavailable. */ }
  if (["civil", "fibra", "antenas", "mantenimiento"].includes(selectedService)) {
    form.elements.service.value = selectedService;
    saveDraft();
    // Consume the incoming choice once; reloading must not overwrite later edits.
    const url = new URL(window.location.href);
    url.searchParams.delete("servicio");
    try { window.history.replaceState(null, "", url.href); } catch { /* Some file previews restrict history. */ }
  }
  form.querySelector('button[type="submit"]').disabled = false;
  const updateDraft = () => {
    clearPrompt.hidden = true;
    clearButton.setAttribute("aria-expanded", "false");
    preview.hidden = true;
    output.value = "";
    status.textContent = "";
    if (submitted) showFormErrors(form, validateContactValues(readValues()));
    saveDraft();
  };
  form.addEventListener("input", updateDraft);
  form.addEventListener("change", updateDraft);
  form.querySelector("[data-copy-query]").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(output.value);
      status.textContent = "Consulta copiada. Todavía no se ha enviado a CIVILTELECOM.";
    } catch {
      output.focus();
      output.select();
      status.textContent = "Seleccionamos la consulta para que puedas copiarla.";
    }
  });

  clearButton.addEventListener("click", () => {
    clearPrompt.hidden = false;
    clearButton.setAttribute("aria-expanded", "true");
    cancelClear.focus();
  });
  cancelClear.addEventListener("click", () => {
    clearPrompt.hidden = true;
    clearButton.setAttribute("aria-expanded", "false");
    clearButton.focus();
  });
  clearPrompt.addEventListener("keydown", (event) => {
    if (event.key === "Escape") cancelClear.click();
  });
  form.querySelector("[data-confirm-clear]").addEventListener("click", () => {
    form.reset();
    submitted = false;
    clearPrompt.hidden = true;
    clearButton.setAttribute("aria-expanded", "false");
    output.value = "";
    preview.hidden = true;
    showFormErrors(form, {});
    try { sessionStorage.removeItem("civiltelecom-query"); } catch { /* Storage can be disabled. */ }
    status.textContent = "Borrador eliminado de esta pestaña.";
    form.elements.name.focus();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearPrompt.hidden = true;
    clearButton.setAttribute("aria-expanded", "false");
    submitted = true;
    const values = readValues();
    const errors = validateContactValues(values);
    preview.hidden = true;
    output.value = "";
    saveDraft();

    showFormErrors(form, errors);

    if (Object.keys(errors).length === 0) {
      const service = form.elements.service;
      output.value = [
        `Solicitud técnica: ${values.subject}`,
        `Empresa u operador: ${form.elements.company.value.trim() || "Por definir"}`,
        `Nombre: ${values.name}`, `Correo: ${values.email}`,
        `Servicio: ${service.value ? service.selectedOptions[0].textContent : "Por definir"}`,
        `Ubicación: ${form.elements.location.value.trim() || "Por definir"}`,
        `Plazo previsto: ${form.elements.timeline.value.trim() || "Por definir"}`, "", values.message
      ].join("\n");
      preview.hidden = false;
      status.textContent = "Consulta preparada. No se ha enviado; los canales oficiales están por confirmar.";
      output.focus();
    } else {
      status.textContent = "Revisa los campos indicados para preparar tu consulta.";
      form.querySelector('[aria-invalid="true"]').focus();
    }
  });
}

function validateContactValues(values) {
  const errors = {};
  const value = (key) => String(values[key] || "").trim();
  if (value("name").length < 2) errors.name = "Ingresa tu nombre.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value("email"))) errors.email = "Ingresa un correo válido.";
  if (value("subject").length < 4) errors.subject = "Indica un asunto más específico.";
  if (value("message").length < 12) errors.message = "El mensaje debe tener al menos 12 caracteres.";
  return errors;
}

function showFormErrors(form, errors) {
  const fields = form.querySelectorAll(".form-field");
  fields.forEach((field) => {
    const control = field.querySelector("input, textarea");
    const error = field.querySelector("[data-error-for]");
    if (!control || !error) return;

    const message = errors[control.name] || "";
    field.classList.toggle("has-error", Boolean(message));
    error.textContent = message;
    control.setAttribute("aria-invalid", String(Boolean(message)));
    const errorId = `${control.id}-error`;
    error.id = errorId;
    const descriptions = (control.getAttribute("aria-describedby") || "").split(/\s+/).filter((id) => id && id !== errorId);
    if (message) descriptions.push(errorId);
    if (descriptions.length) control.setAttribute("aria-describedby", descriptions.join(" "));
    else control.removeAttribute("aria-describedby");
  });
}

function initChatbot() {
  const chatbot = document.querySelector("[data-chatbot]");
  if (!chatbot) return;

  const assistantName = "Mateo IA";
  const assistantAvatar = "assets/images/asistente-ia-civiltelecom.jpg?v=3";
  const toggle = chatbot.querySelector("[data-chatbot-toggle]");
  const panel = chatbot.querySelector(".chatbot-panel");
  const closeButton = chatbot.querySelector("[data-chatbot-close]");
  const header = chatbot.querySelector(".chatbot-header");
  const form = chatbot.querySelector("[data-chatbot-form]");
  const input = chatbot.querySelector("input[name='message']");
  const messages = chatbot.querySelector("[data-chatbot-messages]");
  const quickQuestions = [
    "Preparar proyecto", "Servicios", "Cobertura en Bolivia", "Proyecto Roboré"
  ];
  let guideStep = 0;
  let brief = {};
  const serviceChoices = { "Fibra óptica": "fibra", "Obra civil": "civil", "Antenas": "antenas", "Mantenimiento": "mantenimiento" };
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  panel.setAttribute("aria-label", "Mateo, asistente de CIVILTELECOM");
  messages.setAttribute("role", "log");
  messages.setAttribute("aria-label", "Conversación con Mateo");
  input.maxLength = 1200;
  input.placeholder = "Escribe tu consulta";

  if (toggle) {
    toggle.innerHTML = `
      <img src="${assistantAvatar}" alt="" aria-hidden="true">
      <span class="sr-only">Abrir chat de ayuda</span>
    `;
  }

  if (header && !header.querySelector(".chatbot-avatar")) {
    const title = header.querySelector("strong");
    const identity = document.createElement("div");
    identity.className = "chatbot-identity";
    identity.innerHTML = `
      <img class="chatbot-avatar" src="${assistantAvatar}" alt="" aria-hidden="true">
      <span><strong>${assistantName}</strong><small>Asistente virtual · Respuestas automáticas</small></span>
    `;
    if (title) {
      title.replaceWith(identity);
    } else {
      header.prepend(identity);
    }
  }

  const quickActions = document.createElement("div");
  quickActions.className = "chatbot-quick-actions";
  function showQuestions(questions) {
    quickActions.replaceChildren();
    questions.forEach((question) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = question;
      button.addEventListener("click", () => {
        answer(question);
        if (guideStep === 2 || guideStep === 3) input.focus({ preventScroll: true });
        else if (!button.isConnected) quickActions.querySelector("button")?.focus({ preventScroll: true });
      });
      quickActions.appendChild(button);
    });
  }
  showQuestions(quickQuestions);

  const ctaLinks = document.createElement("div");
  ctaLinks.className = "chatbot-mini-cta";
  const contactLink = document.body.dataset.page === "contacto" ? "#name" : "contacto.html";
  ctaLinks.innerHTML = `
    <a href="${contactLink}">Preparar consulta</a>
    <a href="servicios.html">Ver servicios</a>
  `;
  panel.insertBefore(quickActions, form);
  panel.insertBefore(ctaLinks, form);
  ctaLinks.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeChat(false);
  });

  function answer(question) {
    addMessage(question, "user");
    if (normalizeText(question).trim() === "cancelar guia") {
      guideStep = 0;
      showQuestions(quickQuestions);
      addMessage("Guía cancelada. Puedes consultar otro tema cuando quieras.");
      return;
    }
    if (normalizeText(question).trim() === "preparar proyecto") {
      guideStep = 1;
      brief = {};
      addMessage("1 de 3. ¿Qué servicio necesita tu empresa?");
      showQuestions([...Object.keys(serviceChoices), "Cancelar guía"]);
      return;
    }
    if (guideStep === 1) {
      const choice = Object.keys(serviceChoices).find((label) => normalizeText(question).includes(normalizeText(label).split(" ")[0]));
      if (!choice) { addMessage("Selecciona fibra óptica, obra civil, antenas o mantenimiento."); return; }
      brief.service = serviceChoices[choice];
      brief.subject = `Evaluación de ${choice.toLowerCase()}`;
      guideStep = 2;
      showQuestions(["Cancelar guía"]);
      addMessage("2 de 3. ¿En qué ciudad, ruta o departamento se realizará el trabajo?");
      return;
    }
    if (guideStep === 2) {
      if (question.length < 2) { addMessage("Indica una ciudad o ruta para ubicar el proyecto."); return; }
      if (question.length > 200) { addMessage("Resume la ubicación en un máximo de 200 caracteres. Podrás ampliar los detalles en el alcance."); return; }
      brief.location = question;
      guideStep = 3;
      addMessage("3 de 3. Describe el alcance y el plazo deseado. Por ejemplo: ampliar una ruta existente, con planos disponibles y ejecución planificada.");
      return;
    }
    if (guideStep === 3) {
      if (question.length < 12) { addMessage("Cuéntame un poco más sobre el alcance y el plazo deseado."); return; }
      brief.message = question;
      guideStep = 0;
      showQuestions(quickQuestions);
      addMessage(`Resumen preparado\n${brief.subject}\nUbicación: ${brief.location}\nAlcance: ${brief.message}`);
      const transfer = document.createElement("button");
      transfer.className = "chat-transfer";
      transfer.type = "button";
      transfer.textContent = "Continuar en el formulario";
      const completedBrief = { ...brief };
      transfer.addEventListener("click", () => {
        if (document.body.dataset.page === "contacto") {
          const targetForm = document.querySelector("[data-contact-form]");
          Object.entries(completedBrief).forEach(([key, value]) => { targetForm.elements[key].value = value; });
          targetForm.dispatchEvent(new Event("input", { bubbles: true }));
          closeChat(false);
          targetForm.scrollIntoView({ block: "start", behavior: "auto" });
          targetForm.elements.name.focus({ preventScroll: true });
        } else {
          try {
            const saved = JSON.parse(sessionStorage.getItem("civiltelecom-query") || "{}");
            sessionStorage.setItem("civiltelecom-query", JSON.stringify({ ...saved, ...completedBrief }));
            window.location.href = "contacto.html#consulta";
          } catch {
            addMessage("El navegador no permite conservar el resumen entre páginas. Puedes copiarlo y abrir Contacto.");
          }
        }
      });
      messages.appendChild(transfer);
      messages.scrollTop = messages.scrollHeight;
      return;
    }
    addMessage(getChatbotAnswer(question));
  }

  function addMessage(text, type) {
    const message = document.createElement("p");
    message.className = `chat-message ${type || "bot"}`;
    message.textContent = text;
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
  }

  function openChat() {
    panel.hidden = false;
    chatbot.dataset.open = "true";
    document.body.classList.add("chat-open");
    setPageInert(true);
    toggle.setAttribute("aria-expanded", "true");
    if (!messages.dataset.started) {
      addMessage("Hola, soy Mateo, el asistente virtual de CIVILTELECOM. Te ayudo a preparar el requerimiento de tu empresa en tres pasos o a conocer nuestros servicios. La evaluación final corresponde al equipo técnico.");
      messages.dataset.started = "true";
    }
    closeButton.focus({ preventScroll: true });
  }

  function closeChat(restoreFocus = true) {
    panel.hidden = true;
    chatbot.dataset.open = "false";
    document.body.classList.remove("chat-open");
    setPageInert(false);
    toggle.setAttribute("aria-expanded", "false");
    if (restoreFocus) toggle.focus({ preventScroll: true });
  }

  toggle.addEventListener("click", () => {
    if (panel.hidden) {
      openChat();
    } else {
      closeChat();
    }
  });

  closeButton.addEventListener("click", () => closeChat());
  document.addEventListener("keydown", (event) => {
    if (panel.hidden) return;
    if (event.key === "Escape") closeChat();
    else trapFocus(event, panel);
  });
  // Follow the visible viewport when the mobile keyboard opens.
  const updateViewport = () => {
    const viewport = window.visualViewport;
    document.documentElement.style.setProperty("--chat-height", `${viewport ? viewport.height : window.innerHeight}px`);
    document.documentElement.style.setProperty("--chat-top", `${viewport ? viewport.offsetTop : 0}px`);
    requestAnimationFrame(() => {
      if (!panel.hidden) messages.scrollTop = messages.scrollHeight;
    });
  };
  window.visualViewport?.addEventListener("resize", updateViewport);
  window.visualViewport?.addEventListener("scroll", updateViewport);
  updateViewport();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const question = input.value.trim();
    if (!question) return;

    answer(question);
    input.value = "";
  });
}

function getChatbotAnswer(question) {
  const text = normalizeText(question);

  // Specific intents take precedence over broad words such as "atención" or "fibra".
  if (/urgente|emergencia|falla|corte|critico/.test(text)) {
    return "Para evaluar una incidencia, indica ubicación, servicio afectado, impacto, hora de inicio y disponibilidad de acceso. La respuesta y movilización deben confirmarse con el equipo; este asistente no recibe emergencias ni garantiza atención inmediata.";
  }
  if (/entregable|documento|reporte|medicion|prueba/.test(text)) {
    return "Según el alcance acordado, se contemplan registros fotográficos, mediciones, reportes de avance, observaciones y documentación de cierre. Conviene definir los criterios de aceptación antes de iniciar el trabajo.";
  }
  if (/robore|san jose|chiquitos/.test(text)) {
    return "CIVILTELECOM realizó la instalación de fibra óptica Roboré - San José de Chiquitos para ayudar a la comunidad a acceder a internet. Puedes consultar el caso en Proyectos; el año y las métricas están por confirmar.";
  }
  if (/entel/.test(text)) {
    return "CIVILTELECOM cuenta con experiencia de trabajo con ENTEL. Para revisar antecedentes y documentación aplicables a una contratación, prepara una consulta con el alcance que necesitas.";
  }
  if (/cobertura|bolivia|departamento|pais|santa cruz|cochabamba|oruro|potosi|tarija|beni|pando|chuquisaca/.test(text)) {
    return "Estamos disponibles para evaluar proyectos en los nueve departamentos de Bolivia. La movilización se define según alcance, accesos, cronograma y disponibilidad del equipo.";
  }
  if (/contacto|telefono|correo/.test(text)) {
    return "Los canales oficiales de contacto están por confirmar. Puedes preparar y copiar tu consulta en la página Contacto. El asistente no envía mensajes al equipo.";
  }

  if (text.includes("mateo") || text.includes("nombre") || text.includes("quien eres") || text.includes("quien sos")) {
    return "Soy Mateo IA, el asistente técnico-comercial demo de CIVILTELECOM. Mi función es ayudarte a convertir una idea o necesidad en una solicitud clara: servicio, ubicación, alcance, urgencia, evidencia disponible y datos de contacto.";
  }

  if (text.includes("horario")) {
    return "El horario oficial de atención está por confirmar. Puedes preparar tu requerimiento técnico en Contacto para compartirlo cuando esté disponible el canal oficial.";
  }

  if (text.includes("mensaje") || text.includes("redactar") || text.includes("armar")) {
    return "Puedes enviar algo así: Hola CIVILTELECOM, necesito evaluar un proyecto de telecomunicaciones en [ubicación]. El servicio requerido es [fibra/obra civil/antenas/mantenimiento]. El alcance estimado es [breve descripción], la prioridad es [normal/urgente] y cuento con [fotos/planos/coordenadas]. Quedo atento para coordinar el siguiente paso.";
  }

  if (text.includes("cotizacion") || text.includes("cotizar") || text.includes("precio") || text.includes("costo") || text.includes("presupuesto") || text.includes("requisitos") || text.includes("preparo") || text.includes("preparar") || text.includes("solicitud")) {
    return "Para cotizar o evaluar mejor, envía: ubicación exacta, tipo de servicio, alcance aproximado, urgencia, fotos o planos disponibles, si existe infraestructura previa, restricciones de acceso y un contacto técnico. Con eso la primera respuesta puede ser mucho más precisa.";
  }

  if (text.includes("fibra") || text.includes("empalme") || text.includes("fusion") || text.includes("otdr")) {
    return "En fibra óptica se puede revisar tendido, canalización, fusión, etiquetado, continuidad, pruebas y cierre documental. Para evaluar una ruta conviene indicar punto de inicio, punto final, tipo de zona, postes o ductos disponibles y objetivo de conectividad.";
  }

  if (text.includes("antena") || text.includes("torre") || text.includes("radio base") || text.includes("radiobase") || text.includes("altura")) {
    return "En antenas y torres se revisan accesos, seguridad en altura, estructura, energía, equipos, ventana de trabajo, mantenimiento y registro técnico. Si tienes fotos del sitio o coordenadas, ayudan mucho para una orientación inicial.";
  }

  if (text.includes("obra") || /\bcivil(es)?\b/.test(text) || text.includes("ducto") || text.includes("camara") || text.includes("canalizacion")) {
    return "En obra civil telecom se evalúan canalizaciones, cámaras, ductos, bases, excavaciones, cruces y adecuaciones. Lo ideal es enviar ubicación, tipo de terreno, restricciones, permisos disponibles y fotos del área.";
  }

  if (text.includes("comunidad") || text.includes("internet") || text.includes("rural") || text.includes("pueblo")) {
    return "CIVILTELECOM comunica la conectividad como infraestructura con impacto social. El proyecto Roboré - San José de Chiquitos se presenta como instalación de fibra óptica orientada a ayudar a la comunidad a contar con acceso a internet.";
  }

  if (text.includes("servicio") || text.includes("servicios")) {
    return "CIVILTELECOM trabaja en obras civiles telecom, instalación de fibra óptica, antenas, radio bases, mantenimiento, inspección, logística, control de calidad y gestión técnica de proyectos.";
  }

  if (text.includes("rama") || text.includes("ramas") || text.includes("especialidad") || text.includes("especializacion") || text.includes("areas")) {
    return "Ahora mostramos 16 ramas: obras civiles, fibra óptica, antenas, mantenimiento, gestión técnica, comunidad, logística, documentos, ductos, empalmes, inspección, seguridad, calidad, coordinación local, continuidad y diagnóstico.";
  }

  if (text.includes("ubicacion") || text.includes("direccion") || text.includes("donde") || text.includes("la paz")) {
    return "La sede está en La Paz, Bolivia. La dirección exacta está por confirmar; tenemos disponibilidad para evaluar proyectos en todo el país.";
  }

  if (text.includes("experiencia") || text.includes("anos") || text.includes("trayectoria")) {
    return "CIVILTELECOM S.R.L. fue creada en 2015 y cuenta con más de una década de trayectoria en obras civiles y telecomunicaciones.";
  }

  return "Soy Mateo IA. Puedo ayudarte a preparar una solicitud técnica, pedir datos para cotización, explicar servicios de fibra óptica, antenas, obra civil, cobertura nacional, ENTEL, entregables y el proyecto Roboré - San José de Chiquitos.";
}

function normalizeText(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
