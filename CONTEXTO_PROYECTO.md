# 💍 Contexto Maestro del Proyecto: Boda Mariana & Memo ("Boda de los Chicos")

Este documento contiene la arquitectura completa, estado actual, historial de decisiones técnicas, errores superados y soluciones implementadas para el proyecto de la boda. Sirve como referencia integral para continuar el desarrollo en cualquier sesión de trabajo.

---

## 1. Infraestructura y Enlaces Principales

- **URL de Producción:** [https://bodadeloschicos.com/](https://bodadeloschicos.com/) (Dominio oficial personalizado) / `https://bodadeloschicos.pages.dev/` (Cloudflare Pages).
- **Repositorio de GitHub:** `https://github.com/memogrinan/bodadeloschicos.git` (Rama: `main`).
  *Cada `git push origin main` despliega automáticamente la nueva versión en Cloudflare Pages en segundos.*
- **Backend Google Apps Script (Trix / Google Sheets):**
  `https://script.google.com/macros/s/AKfycbwzF6-fMJJeXgOj3djFSm_vo1ZEteYRIj0PFXXhq_4q7eLcoCVmuTNRcKto2GSR-G8XSQ/exec`
  *Maneja la lista oficial de invitados, integrantes de familias, pases, confirmación civil/sábado, alergias y estadísticas del Arcade.*
- **Base de Datos Firebase Realtime Database:**
  `https://boda-los-chicos-default-rtdb.firebaseio.com/`
  *Maneja puntajes de los minijuegos, ChiCoins, tiempos de juego y el Leaderboard en tiempo real.*
- **Versión de Cache-Buster Actual:** `v=29.0` en favicons e imágenes clave / `v=30.0` en scripts de `index.html` y `en/index.html`.

---

## 2. Mapa de Archivos del Proyecto

| Archivo | Rol y Responsabilidad |
| :--- | :--- |
| `index.html` & `js/index.js` | Invitación principal: portada, contador regresivo al 13-Feb-2027 2:40 PM, historia, lugares, itinerario condicional, hospedaje, regalos (enlace directo a Uniko), RSVP conectado a Sheets, acceso a minijuegos y galería de fotos. |
| `juegos.html` & `js/juegos.js` | Plataforma de 4 minijuegos web (Chicosaurio, Atrapa el Amor, Atrapa a Maddie, Camino a Puebla), sistema de ChiCoins y Leaderboard sincronizado con Firebase. |
| `regalos.html` & `js/regalos.js` | Tienda interactiva histórica de regalos de luna de miel (se mantiene como página de respaldo; el botón principal de regalos en `index.html` lleva a la mesa oficial de Uniko). |
| `admin.html` & `js/admin.js` | Panel administrativo protegido por contraseña para monitoreo de jugadores, ajuste manual de monedas, canjes de premios físicos y gestión de base de datos. |
| `worker/` & `TODO_STRIPE.md` | Código y especificación técnica archivada del Cloudflare Worker para Stripe. |

---

## 3. Arquitectura del RSVP y Parámetros Personalizados

### A. Detección de Invitación
- Los invitados entran con enlaces del tipo `/?p=chicos` (o `?id=chicos`, o `?invitado=chicos`).
- El valor del parámetro se guarda persistentemente en `localStorage.getItem("bodachicos_party_id")`. Si no se provee ningún parámetro en la URL ni en memoria, el sistema utiliza `"chicos"` como valor por defecto para pruebas.
- Al cargar `index.html`, se realiza una petición GET a `APPS_SCRIPT_URL?id={partyId}`.

### B. Mapeo de Google Sheets & Columna O ("ID Arcade")
- El Apps Script devuelve un objeto JSON estructurado:
  ```json
  {
    "status": "success",
    "id": "chicos",
    "nombre": "Chicos",
    "integrantes": "Guillermo Griñán, Mariana Cordero",
    "integrantesData": [
      { "id": "001", "name": "Guillermo Griñán" },
      { "id": "002", "name": "Mariana Cordero" }
    ],
    "invitaCivil": "SI",
    "pasesSabado": 2,
    "estadoSabado": "...",
    "estadoCivil": "...",
    "alergias": "...",
    "celebracion": "..."
  }
  ```
- **La Columna O del Google Sheet ("ID Arcade"):**
  - Los novios asignan IDs fijos en texto con formato `001`, `002`, `003`... directamente en la Columna O.
  - Se eliminó cualquier dependencia del índice de fila (`rowIndex`) para que reordenar o insertar filas en el Sheet nunca altere el ID de ningún invitado.
  - El frontend normaliza automáticamente cualquier ID asegurando el prefijo **`GID_`** (`001` -> `GID_001`), evitando que ningún motor numérico o base de datos se coma los ceros a la izquierda.
- **Itinerario Condicional:** El bloque `#itineraryFridayBlock` (Boda Civil del viernes 12) se muestra únicamente si `invitaCivil === "SI"`.

---

## 4. Arquitectura del Arcade y Base de Datos (Firebase)

### A. Llave Primaria Inmutable (`Guest ID`)
- En Firebase Realtime Database, todos los registros dentro de `/players/` se guardan utilizando el **`Guest ID`** como llave primaria estricta (ej. `/players/GID_001`, `/players/GID_002`).
- **Por qué esta decisión es crítica:**
  - El ID es la única fuente de verdad inmutable.
  - La clave del registro en Firebase ignora el nombre real o apodo de la persona para su identidad estructural.
  - Si el invitado cambia de apodo o los novios ajustan el nombre en el Google Sheet, **solo se actualizan las propiedades del registro existente**, NUNCA se crea una nueva línea o registro.

### B. Autocompletado Inteligente en Modal (`selectMemberChoice`)
- Cuando un invitado abre el modal de Gamertag y toca el botón con su nombre:
  1. El input se limpia brevemente para evitar confusiones.
  2. Consulta a Firebase bajo `/players/{playerGuestId}` directamente por su ID inmutable. Si ya tiene un `gamerTag`, lo rellena y parpadea en verde (`bg-green-50`).

### C. Cazafantasmas y Deduplicación
- En `saveGamerTag()`, el sistema busca y elimina cualquier nodo obsoleto que tuviera el Gamertag como clave, purgando registros duplicados.
- En `renderLeaderboardTable()`, el código agrupa por `guestId` inmutable (`GID_001`, `GID_002`), garantizando matemáticamente que jamás aparezcan dos filas para la misma persona en el ranking.

---

## 5. Solución Universal Anti-Layout Shift (Scroll Jumps en la Invitación)

### A. El Problema Original
Al ingresar con enlace personalizado, Google Sheets tarda 1.5 - 2 segundos en responder. Durante ese tiempo, el usuario podía hacer clic en el menú (ej. "Juegos") o desplazarse. Cuando Google Sheets finalmente respondía:
1. Se mostraba el Itinerario del Viernes (+350px de altura arriba).
2. La tarjeta de RSVP cambiaba de spinner (~80px) a resumen (~450px).
3. Esta inyección de casi 800px empujaba todo el contenido inferior hacia abajo. El navegador quedaba varado en las coordenadas viejas, dejando al usuario mirando la tarjeta de RSVP en lugar de Juegos.

### B. Lo que NO funcionó (Soluciones descartadas para NO repetir):
1. **Animar scroll post-fetch (`scrollIntoView({ behavior: 'smooth' })` con `setTimeout`):** Provocaba un rebote visual muy tosco donde la pantalla se desplazaba primero a RSVP y luego bajaba a Juegos, pareciendo un bug.
2. **`scroll-margin-top: 75px` global:** Añadía una separación fija que no gustó estéticamente.
3. **Condicionales por nombre de sección (`if (hash === '#juegos' || hash === '#fotos')`):** Enfoque frágil y difícil de mantener que ignoraba las secciones intermedias y rompía los scrolls suaves al inicio de la página.

### C. La Solución Universal Implementada (`v=15.0`):
1. **Altura Estable en RSVP:**
   Se aplicó a la tarjeta de confirmación en `index.html`:
   ```css
   min-height: 380px; display: flex; flex-direction: column; justify-content: center;
   ```
   El spinner de carga ahora vive dentro de una tarjeta con altura reservada, eliminando el crecimiento brusco de RSVP.
2. **Compensación Matemática por Elemento Activo (Condicionada a `isPastItinerary`):**
   Inmediatamente antes y después de que Google Sheets altere el DOM:
   ```javascript
   const itinerarioEl = document.getElementById("itinerario");
   // Solo compensar si el usuario ya alcanzó o superó la sección de Itinerario.
   // Si todavía no llega (Inicio, Historia, Lugar), el DOM inferior no afecta su pantalla y no se altera el scroll:
   const isPastItinerary = itinerarioEl ? (itinerarioEl.getBoundingClientRect().top <= 100) : false;

   const hashTarget = (window.location.hash && window.location.hash !== "#inicio") 
       ? document.querySelector(window.location.hash) 
       : null;
   const anchorEl = isPastItinerary
       ? (hashTarget || (window.scrollY > 150 ? document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 3) : null))
       : null;
   const prevTop = anchorEl ? anchorEl.getBoundingClientRect().top : 0;

   // ... Se modifica el DOM con la respuesta de Google Sheets ...

   if (anchorEl) {
       const newTop = anchorEl.getBoundingClientRect().top;
       const delta = newTop - prevTop;
       if (delta !== 0) {
           window.scrollBy(0, delta);
       }
   }
   ```
   - **Sincrónico:** Se ejecuta en el mismo ciclo de renderizado del navegador.
   - **Estabilidad Absoluta en Inicio/Historia/Lugar:** Si el usuario está antes de Itinerario (`isPastItinerary === false`), `anchorEl` es `null` y el scroll no se altera en lo más mínimo.
   - **Invisible:** Si estás en secciones inferiores (Itinerario, Hospedaje, RSVP, Juegos, Fotos), se compensa la diferencia exacta sin animaciones ni brincos.

---

## 6. Historial de Decisiones en la Galería de Fotos (Fancybox / Chicosgram)

- **Parpadeo y Flickering al Abrir Fotos en Celular:**
  - Ocurría cuando Fancybox intentaba recalcular dimensiones durante la apertura usando zoom animado o arrastre táctil de Panzoom.
  - **Solución definitiva aplicada:**
    - `Images: { zoom: false }` para evitar cálculos dinámicos de escala.
    - `showClass: "f-fadeIn"`, `hideClass: "f-fadeOut"` para transiciones suaves basadas en opacidad.
    - `Panzoom: { touch: false }` en el carrusel de Fancybox.
- **Botón Atrás del Navegador (Android/iOS):**
  - Se vinculó `window.addEventListener('popstate', ...)` para que al presionar el botón físico o gesto de "Atrás", se cierre Fancybox limpiamente sin retroceder a la página web anterior.

---

## 7. Menú Móvil y Acceso Directo PWA Cross-Platform (`v=16.0`)

- **Cierre Táctil al Dar Clic Fuera:**
  - Se implementó un overlay difuso (`#drawerOverlay`) con `backdrop-filter: blur(4px)` y fondo semi-transparente oscuro.
  - Al hacer clic o tocar fuera de `#mobileDrawer` y `#menuToggle`, se cierra automáticamente el menú y el icono vuelve a alternar a hamburguesa.
- **Botón "Instalar App de los Chicos" Anclado al Fondo:**
  - Vive dentro de un contenedor `.drawer-bottom` con `margin-top: auto` y respeta `env(safe-area-inset-bottom)` de iPhones.
- **Estrategia Adaptativa Cross-Platform:**
  - **Android / Chromium:** Utiliza el evento `beforeinstallprompt` para abrir el diálogo nativo de instalación con 1 clic.
  - **iOS (iPhone/iPad Safari):** Abre el modal interactivo `#iosInstallModal` con guía visual paso a paso (Compartir -> Añadir a inicio).
  - **Modo Standalone:** Detecta si la web ya corre como app instalada y actualiza el botón a *"App Instalada ✓"*.

---

## 8. Acabado Editorial y Mejoras Estéticas Profesionales (`v=18.0`)

- **Sistema de Sombras Multicapa (Layered Soft Shadows):**
  - Implementación de variables CSS (`--shadow-subtle`, `--shadow-card`, `--shadow-elevated`, `--shadow-btn`, `--shadow-btn-hover`) con tintes olivo translúcidos que reemplazan las sombras oscuras duras.
  - Aplicadas en tarjetas de ceremonia y recepción (`.glass-card`), carrusel principal (`.carousel-container`), tarjeta de confirmación (`#confirmacion`) e hitos del timeline (`.hz-icon-wrapper`).
- **Microinteracciones y Feedback Táctil Háptico:**
  - Botones (`.btn`, `.btn-rsvp`, `.btn-hotel`, `.btn-cal`, `.carousel-btn`, acordeones del FAQ) con respuesta inmediata al tacto: `:active { transform: scale(0.96-0.97); }` con curvas cúbicas suaves y supresión del resaltado gris del navegador.
- **Celebración con Confetti post-RSVP (`canvas-confetti`):**
  - Al completar la confirmación con al menos un "Sí asistirá", se dispara automáticamente una ráfaga con la paleta de la boda (dorado `#d4af37`, olivo `#52582f`, crema `#f3e8c8`, champagne).
- **Adaptación a Áreas Seguras de iPhone:**
  - `viewport-fit=cover` en la meta etiqueta viewport y `padding-bottom: calc(... + env(safe-area-inset-bottom))` en el footer para evitar interferencias con la barra de inicio de iOS.
- **Protección de Rendimiento y Memoria en Chicosgram:**
  - Límite de hasta **10 fotos por turno** tanto al seleccionar archivos como al procesar la subida, garantizando alta velocidad de compresión sin riesgo de saturar la memoria RAM en celulares de invitados.
  - Indicador visual explícito `(Hasta 10 por turno)` junto a la etiqueta de selección.

---

## 9. Actualización del Carrusel "Nuestra Historia en Fotos" (`v=22.0`)

- **Incorporación y Optimización de Fotografías:**
  - Se convirtieron `foto_bimbo.jpeg` y `foto_casa_puebla.jpeg` a formato WebP optimizado en `ImagenesWeb/Optimizadas/` (`foto_bimbo.webp` con 88.1 KB tras ajuste de recorte y `foto_casa_puebla.webp` con 223.8 KB) preservando orientación EXIF y resolución nítida.
- **Orden Oficial de las 5 Fotografías en `index.html`:**
  1. `ImagenesWeb/Optimizadas/foto_bimbo.webp?v=22.0` (Nuestros inicios / Oficina Bimbo 2018)
  2. `ImagenesWeb/Optimizadas/historia_omitlan.webp` (Viaje a Omitlán 2021)
  3. `ImagenesWeb/Optimizadas/foto_casa_puebla.webp` (Casa en Puebla 2023)
  4. `ImagenesWeb/Optimizadas/historia_maddie_solita.webp` (Llegada de Maddie)
  5. `ImagenesWeb/Optimizadas/historia_propuesta.webp` (Propuesta de matrimonio 2025)

---

## 10. Reordenamiento de Menús y Botones Editoriales de Navegación (`v=23.0`)

- **Sincronización del Menú Web (Escritorio):**
  - Se reordenó `.nav-links` para respetar estrictamente la secuencia vertical de la página:
    `Inicio` → `Historia` → `Lugar` → `Itinerario` → `Hospedaje` → `Regalos` → `RSVP` → `Juegos` → `Fotos`.
  - Ahora coincide al 100% con la navegación del drawer móvil `.mobile-drawer`.
- **Botones Píldora de Navegación (Google Maps & Waze):**
  - Se reemplazaron los antiguos botones rectangulares azules (#4285F4 y #33CCFF) en las tarjetas de Ceremonia y Fiesta por botones con silueta de píldora redondeada (`border-radius: 9999px`) en tono verde olivo institucional (`#4a4e30`).
  - Cuentan con tipografía en mayúsculas con espaciado editorial, iconos vectoriales SVG precisos (Pin clásico de Maps y contorno de Waze con rostro y ruedas) y feedback táctil `:active` con microelevación en `:hover`.

---

## 11. Corrección de Restricciones Alimenticias y Resumen RSVP (`v=24.0`)

- **Prevención de Contaminación Cruzada y Duplicados:**
  - Se eliminó el bug donde si solo un integrante tenía restricciones, el fallback de Apps Script o el split asignaba la restricción del otro integrante a quien no tenía nada (ej. *Guillermo: Mariana: Alergica al gluten*).
  - Al cargar el formulario (`renderRSVPForm`), se verifica y limpia cualquier prefijo cruzado. Si el integrante no tiene restricción o dice "Ninguna", el campo `<textarea>` queda **estrictamente vacío** mostrando su placeholder limpio (evitando autollenar con "Ninguna").
- **Envío Pareado y Escritura Limpia en Google Sheets (Trix):**
  - Al enviar (`submitRSVPForm`), se envía siempre el par `Nombre: Restricción` para cada integrante. Si el campo está vacío, se envía vacío y Apps Script guarda la celda en blanco `""` en lugar de la palabra "Ninguna", evitando registros fantasmas.
- **Formato Editorial en Resumen de Confirmación:**
  - El resumen (`renderRSVPSummaryView`) adopta el mismo patrón de las confirmaciones de asistencia: desglosa a cada invitado en una línea con su nombre y restricción (o `Ninguna` en tipografía sutil por defecto).
  - Se actualizó el emoji a **🍽️ (Plato con cubiertos)** reemplazando a `🥗` para una estética nítida y elegante.

---

## 12. Actualización de Mesa de Regalos, Contador e Identidad Visual (`v=28.0` / `v=29.0`)

1. **Mesa de Regalos Oficial (UNIKO):**
   - Se deprecó la integración de cobro directo con Stripe en `index.html`.
   - El botón principal de la sección de regalos ahora abre directamente la mesa oficial de Uniko en pestaña nueva: `https://evento.uniko.co/bodadeloschicos/`.
   - `regalos.html` se mantiene como respaldo histórico.
2. **Contador Regresivo en Portada:**
   - Fecha objetivo configurada: **Sábado 13 de febrero de 2027 a las 2:40 PM** (`2027-02-13T14:40:00-06:00`).
   - Cuenta hacia atrás con exactitud horaria y se desactiva limpiamente una vez alcanzada la fecha.
3. **Identidad Visual de Maddie & Favicon:**
   - **Ícono de Maddie en la Línea de Tiempo (Hito 2024):** Actualizado con el trazo oficial `maddie_logo_contorno.webp` en `ImagenesWeb/Optimizadas/` (color olivo institucional `#52582F`).
   - **Favicon de todo el sitio:** Se actualizó en `index.html`, `regalos.html`, `juegos.html` y `admin.html` a `maddie_logo_contorno_fondo.webp` con refresco de caché `?v=29.0`.

---

## 13. Arquitectura Multi-Idioma & Versión en Inglés (`v=30.0`)

1. **Estructura de Directorio y Enrutamiento:**
   - La versión en inglés vive en el subdirectorio físico `/en/` (`en/index.html`), aprovechando el enrutamiento nativo de Cloudflare Pages.
   - Permite compartir enlaces directos como `https://bodadeloschicos.com/en/?p=smith` con Open Graph tags dedicados en inglés (título y descripción para WhatsApp / iMessage sin flash de traducción).
2. **Selector de Idioma Bilingüe:**
   - **Escritorio:** Píldora estética en `.nav-links` (`🇲🇽 ES | 🇺🇸 EN`) con estado activo resaltado.
   - **Móvil:** Botones interactivos con banderas (`🇲🇽 Español` / `🇺🇸 English`) dentro de `.mobile-drawer`.
3. **Persistencia de Parámetro `?p=` y Lenguaje:**
   - El script `js/index.js` detecta si el usuario está en `/en/` o `/` y persiste su preferencia en `localStorage.getItem('bodachicos_lang')`.
   - El inyector de enlaces `GLOBAL URL PARAMETER PRESERVER` propaga transparentemente el `partyId` tanto a enlaces en español como en inglés (`/en/` y `/`).
4. **Traducción Contextual Completa:**
   - Portada, contador, Nuestra Historia (anécdota de oficina 2018, Puebla 2021, Cholula 2023, Maddie 2024, compromiso 2025).
   - Locaciones ("Church Ceremony" y "Wedding Reception" manteniendo nombres propios en español: "Parroquia de San Andrés Apóstol" y "Hacienda San José Actipan").
   - Hospedaje con código internacional (+52) en todos los teléfonos y tarifas en MXN.
   - FAQ totalmente en inglés ("Frequently Asked Questions" y respuesta de estacionamiento traducida).
   - Mesa de regalos oficial apuntando directamente a Uniko (se removió "y futuro hogar" de todos los textos).
   - RSVP dinámico: títulos, alertas, opciones (*"Will attend" / "Will not attend"*), placeholders de restricciones alimenticias y resumen de confirmación en inglés con compatibilidad directa hacia Google Sheets.
   - Nombres oficiales de minijuegos en inglés: **Chicosaurus**, **Love in the Air**, **Whack-a-Maddie!** y **Road to Puebla**.
   - Arcade bilingüe completo: `en/juegos.html` con UI traducida (GamerTag, Leaderboard, modales, instrucciones retro dinámicas, Game Over bilingüe) y selector de idioma directo en la cabecera del Arcade (`juegos.html` ⟷ `en/juegos.html`).
   - Chicosgram (paparazzi upload, validaciones de lote y mensajes de estado).

---

## 14. Directrices Operativas Obligatorias para Nuevas Sesiones

1. **Gestión de Git y Despliegue en Cloudflare Pages:**
   - El repositorio usa **sparse-checkout**.
   - Al agregar archivos con `git add`, especificar siempre las rutas explícitas (ej. `git add index.html en/index.html js/index.js`). **Nunca** usar `git add .` o patrones globales que incluyan `img/` (carpeta excluida del sparse-checkout).
   - Siempre hacer `git push origin main` al terminar cualquier cambio (requiere `BypassSandbox: true` por política de red). Cloudflare Pages compila y despliega en producción automáticamente.
2. **Manejo de Imágenes y Pillow en Python:**
   - Toda imagen nueva (.png, .jpg) que se suba debe ser convertida a `.webp` optimizado en `ImagenesWeb/Optimizadas/` antes de enlazarse en el HTML.
   - Pillow está instalado en el entorno de usuario de macOS:
     ```python
     import sys
     sys.path.insert(0, "/Users/ggrinan/Library/Python/3.9/lib/python/site-packages")
     from PIL import Image
     ```
   - Al ejecutar scripts con Pillow o comandos con red, ejecutar con `BypassSandbox: true`.
3. **Cache-Busting & Paridad de Idiomas:**
   - Cada vez que se modifique un archivo `.js`, `.css` o imagen compartida, incrementar el sufijo de versión en los archivos HTML correspondientes (ej. `?v=30.0`).
   - **Regla de Paridad:** Todo cambio visual, estructural o de contenido realizado en `index.html` debe replicarse en `en/index.html` para mantener ambas versiones 100% alineadas.
4. **Preservación del Código y Comentarios:**
   - Mantener la integridad de los comentarios existentes en `index.html`, `en/index.html`, `js/index.js` y `CONTEXTO_PROYECTO.md`.

---

## 15. Temas Pendientes para Futuras Sesiones

1. **Galería Final:**
   - Carga y compresión de las fotografías oficiales en alta resolución hacia la carpeta `ImagenesWeb/Optimizadas/`.
2. **Consulta a Google Sheets en Vivo:**
   - Se mantiene la consulta directa y en vivo a Google Sheets (sin caché local forzado) para garantizar que cualquier cambio manual en la lista de invitados o en sus pases se refleje siempre con la información más actualizada.


