# CIVILTELECOM S.R.L. | Proyecto de portafolio

CIVILTELECOM S.R.L. me contrató para diseñar y desarrollar su sitio web corporativo. Este proyecto forma parte de mi portafolio como desarrollador web.

**Desarrollo:** [juanda832](https://github.com/juanda832).

**Sitio web:** [Ver el proyecto publicado](https://juanda832.github.io/civiltelecom/).

## Sobre el proyecto

Sitio corporativo multipagina para CIVILTELECOM S.R.L., empresa boliviana creada en 2015, con experiencia de trabajo junto a ENTEL y disponibilidad para proyectos a lo largo de toda Bolivia. Esta construido solo con HTML5, CSS3 y JavaScript puro.

El trabajo incluye cinco páginas enlazadas, diseño responsive, galerías de servicios, portafolio de proyectos, navegación accesible y el asistente de demostración Mateo. Las imágenes generadas con IA son ilustrativas y no se presentan como fotografías documentales de obras o integrantes reales de la empresa.

La versión publicada es una muestra del proyecto: los datos de contacto oficiales están pendientes y el formulario prepara un resumen, pero todavía no envía solicitudes.

## Ejecutar localmente

```bash
python3 -m http.server 8000
```

Luego abrir `http://127.0.0.1:8000/index.html`.

## Datos pendientes de reemplazo

- `assets/videos/video.mp4`: video hero 1920x1080 de obras civiles, fibra optica y antenas.
- Telefono y correo: pendientes. No se publican enlaces a datos de ejemplo.
- Direccion: `La Paz, Bolivia - Direccion exacta por confirmar`.
- Ano del proyecto Robore - San Jose de Chiquitos.

Los comentarios HTML marcan los puntos donde se pueden regenerar o reemplazar imagenes con DALL-E u otro servicio de IA.

## Consultas y asistente

El formulario valida campos y prepara un resumen copiable; no envia correos ni solicitudes a un servidor. El borrador se conserva en `sessionStorage` mientras la pestaña permanezca abierta, cuando el navegador lo permite. No introducir informacion sensible en la demostracion.

Mateo utiliza respuestas locales y una guia de tres pasos: servicio, ubicacion y alcance. El resumen puede pasar al formulario de contacto. Antes de habilitar envios reales, confirmar los canales oficiales e integrar un backend con validacion del lado del servidor.

La navegacion, el chat y los detalles de proyecto admiten teclado y Escape. Las 16 especialidades de Quienes somos usan elementos HTML `details`, sin dependencias.

## Imagenes generadas

Las imagenes JPG de `assets/images/` estan preparadas a 1920x1080 y optimizadas para web. Incluyen escenas de obras civiles, fibra optica, antenas, inspeccion de red, comunidad conectada, mantenimiento y planificacion tecnica.

## Comprobaciones

```bash
node --check assets/js/main.js
node --test tests/interactions.test.cjs
python3 tests/check_site.py
python3 tests/check_site.py --url http://127.0.0.1:8000
```

La ultima comprobacion necesita el servidor local activo. Para cambios de interfaz, revisar las cinco paginas a 1440, 768, 390 y 320 px, la navegacion movil, los filtros, el modal de proyecto y la transferencia Mateo-formulario.

Comprobar también que el servicio elegido se conserve al recargar Contacto, que los errores desaparezcan al corregir los campos y que el menú en orientación horizontal no quede cubierto por Mateo. El video de inicio dispone de pausa manual y respeta la preferencia de movimiento reducido.
