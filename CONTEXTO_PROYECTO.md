# 💍 Contexto Maestro del Proyecto: Boda Mariana & Memo ("Boda de los Chicos")

Este documento contiene la arquitectura completa, estado actual, historial de decisiones técnicas, errores superados y soluciones implementadas para el proyecto de la boda. Sirve como referencia integral para continuar el desarrollo en cualquier sesión de trabajo.

---

## 1. Infraestructura y Enlaces Principales

- **URL de Producción:** [https://bodadeloschicos.pages.dev/](https://bodadeloschicos.pages.dev/) (Alojado en Cloudflare Pages).
- **Repositorio de GitHub:** `https://github.com/memogrinan/bodadeloschicos.git` (Rama: `main`).
  *Cada `git push origin main` despliega automáticamente la nueva versión en Cloudflare Pages en segundos.*
- **Backend Google Apps Script (Trix / Google Sheets):**
  `https://script.google.com/macros/s/AKfycbwzF6-fMJJeXgOj3djFSm_vo1ZEteYRIj0PFXXhq_4q7eLcoCVmuTNRcKto2GSR-G8XSQ/exec`
  *Maneja la lista oficial de invitados, integrantes de familias, pases, confirmación civil/sábado, alergias y estadísticas del Arcade.*
- **Base de Datos Firebase Realtime Database:**
  `https://boda-los-chicos-default-rtdb.firebaseio.com/`
  *Maneja puntajes de los minijuegos, ChiCoins, tiempos de juego y el Leaderboard en tiempo real.*
- **Versión de Cache-Buster Actual:** `v=18.0` (Inyectado en scripts de todos los HTML para evitar atascos de caché en navegadores de invitados).

---

## 2. Mapa de Archivos del Proyecto

| Archivo | Rol y Responsabilidad |
| :--- | :--- |
| `index.html` & `js/index.js` | Invitación principal: portada, historia, lugares, itinerario condicional, hospedaje, regalos, RSVP conectado a Sheets, acceso a minijuegos y galería de fotos. |
| `juegos.html` & `js/juegos.js` | Plataforma de 4 minijuegos web (Chicosaurio, Atrapa el Amor, Atrapa a Maddie, Camino a Puebla), sistema de ChiCoins y Leaderboard sincronizado con Firebase. |
| `regalos.html` & `js/regalos.js` | Tienda interactiva de regalos de luna de miel con carrito de compras dinámico y modal de dedicatoria. |
| `admin.html` & `js/admin.js` | Panel administrativo protegido por contraseña para monitoreo de jugadores, ajuste manual de monedas, canjes de premios físicos y gestión de base de datos. |
| `worker/` & `TODO_STRIPE.md` | Código y especificación técnica del Cloudflare Worker para balancear pagos entre dos cuentas de Stripe. |

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
    "integrantes": "Memo, Mariana Cordero",
    "integrantesData": [
      { "id": "GID_chicos_2", "name": "Memo" },
      { "id": "GID_chicos_3", "name": "Mariana Cordero" }
    ],
    "invitaCivil": "SI",
    "pasesSabado": 2,
    "estadoSabado": "...",
    "estadoCivil": "...",
    "alergias": "...",
    "celebracion": "..."
  }
  ```
- **La Columna O del Google Sheet:**
  - Si los novios escriben un ID personalizado (ej. `MEMO`, `INV-01`), el Apps Script lo toma directamente.
  - Si la columna O está vacía, el Apps Script genera automáticamente un ID inmutable: `GID_{partyId}_{rowIndex}` (ej. `GID_chicos_2`).
- **Itinerario Condicional:** El bloque `#itineraryFridayBlock` (Boda Civil del viernes 12) se muestra únicamente si `invitaCivil === "SI"`.

---

## 4. Arquitectura del Arcade y Base de Datos (Firebase)

### A. Llave Primaria Inmutable (`Guest ID`)
- En Firebase Realtime Database, todos los registros dentro de `/players/` se guardan utilizando el **`Guest ID`** como llave primaria (ej. `/players/GID_chicos_2`).
- **Por qué esta decisión es crítica:** En versiones iniciales se usaba el `GamerTag` o el `Nombre Real` como llave. Esto provocaba que si el usuario cambiaba de apodo ("Mermino" a "Mermin"), se creaba un nuevo registro duplicando al usuario en el Leaderboard y perdiendo sus puntos. Con el `Guest ID`:
  - Si el invitado cambia de apodo 10 veces, solo se actualiza la propiedad `gamerTag` dentro del mismo nodo.
  - Si los novios cambian el nombre del invitado en el Excel (ej. de "Guillermo Griñán" a "Memo"), su ID sigue siendo el mismo y el progreso nunca se pierde.

### B. Autocompletado Inteligente en Modal (`selectMemberChoice`)
- Cuando un invitado abre el modal de Gamertag y toca el botón con su nombre:
  1. El input se limpia brevemente para evitar confusiones.
  2. Consulta a Firebase bajo `/players/{playerGuestId}`. Si ya tiene un `gamerTag`, lo rellena y parpadea en verde (`bg-green-50`).
  3. Si no lo encuentra por ID directo (cuenta no migrada), busca por la propiedad interna `guestId`, y finalmente por `realName` como respaldo histórico.

### C. Cazafantasmas y Deduplicación
- En `saveGamerTag()`, el sistema busca y elimina cualquier nodo obsoleto que tuviera el Gamertag anterior o que compartiera el mismo `realName` con otra llave, purgando registros duplicados.
- En `renderLeaderboardTable()`, el código agrupa por `guestId` antes de ordenar, garantizando matemáticamente que jamás aparezcan dos filas para la misma persona en el ranking.

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
2. **Compensación Matemática por Elemento Activo:**
   Inmediatamente antes y después de que Google Sheets altere el DOM:
   ```javascript
   const hashTarget = (window.location.hash && window.location.hash !== "#inicio") 
       ? document.querySelector(window.location.hash) 
       : null;
   const anchorEl = hashTarget || (window.scrollY > 150 ? document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 3) : null);
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
   - **Universal:** Cero nombres de secciones hardcodeados; funciona con cualquier sección actual o futura.
   - **Invisible:** Si estás en Inicio o Historia, `delta = 0` y no se mueve nada. Si estás en secciones inferiores, se compensa la diferencia exacta sin animaciones ni brincos.

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

---

## 9. Temas Pendientes para Futuras Sesiones

1. **Mesa de Regalos & Stripe (`regalos.html`):**
   - El frontend cuenta con carrito dinámico funcional en diseño (suma productos, desglose y dedicatoria).
   - Falta conectar el Cloudflare Worker (`worker/`) para balancear los pagos 50/50 entre las cuentas de Stripe de Memo y Mariana según el plan en `BodaWebpage/TODO_STRIPE.md`.
2. **Optimizaciones Técnicas para 200 Invitados (Opcional):**
   - Caché local en `localStorage` para pases de Google Sheets (0ms de carga en visitas recurrentes).
   - Límite de 5 fotos por lote en Chicosgram para protección de memoria RAM en móviles.
3. **Galería Final:**
   - Carga y compresión de las fotografías oficiales en alta resolución hacia la carpeta `ImagenesWeb/Optimizadas/`.
