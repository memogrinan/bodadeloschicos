
// GLOBAL URL PARAMETER PRESERVER & LANGUAGE PRESERVER
// Asegura que el parámetro '?p=' (Party ID) viaje a todas las páginas internas e idiomas.
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const partyId = urlParams.get('p') || urlParams.get('id') || urlParams.get('invitado') || localStorage.getItem('bodachicos_party_id');
    
    // Si la URL actual es /en/ o tiene param lang=en, recordarlo
    if (window.location.pathname.startsWith('/en') || urlParams.get('lang') === 'en') {
        localStorage.setItem('bodachicos_lang', 'en');
    } else if (window.location.pathname === '/' && !urlParams.get('lang')) {
        // Si el usuario navegó explícitamente a la raíz en español
        if (document.documentElement.lang === 'es') {
            localStorage.setItem('bodachicos_lang', 'es');
        }
    }
    
    if (partyId) {
        // Guardamos o actualizamos en cache
        localStorage.setItem('bodachicos_party_id', partyId);
        
        document.querySelectorAll('a').forEach(link => {
            const href = link.getAttribute('href');
            // Solo inyectar en links que apunten a htmls internos, al root o a /en/
            if (href && (href.includes('.html') || href === '/' || href.startsWith('/en') || href.startsWith('../')) && !href.startsWith('http') && !href.startsWith('tel') && !href.startsWith('javascript')) {
                try {
                    const urlObj = new URL(link.href, window.location.origin);
                    urlObj.searchParams.set('p', partyId);
                    link.href = urlObj.toString();
                } catch(e) {}
            }
        });
    }
});

// INYECCION DE ESTILOS GLOBALES (SKELETON)
if (!document.getElementById('cg-dynamic-styles')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'cg-dynamic-styles';
    styleEl.innerHTML = `
        @keyframes skeletonPulse {
            0% { background-color: #e5e7eb; }
            50% { background-color: #f3f4f6; }
            100% { background-color: #e5e7eb; }
        }
        .skeleton-loader-bg {
            animation: skeletonPulse 1.5s ease-in-out infinite;
        }
    `;
    document.head.appendChild(styleEl);
}

// VARIABLES GLOBALES PARA LA GALERÍA DE INVITADOS
        let guestImages = []; // Almacena las URLs de las fotos cargadas
        let currentGuestImageIndex = 0; // Índice de la foto activa

        // LÓGICA DE CONTROL DEL MENÚ HAMBURGUESA DESPLEGABLE (MOBILE)
        const menuToggle = document.getElementById("menuToggle");
        const mobileDrawer = document.getElementById("mobileDrawer");
        const drawerOverlay = document.getElementById("drawerOverlay");

        function openDrawer() {
            if (mobileDrawer) mobileDrawer.classList.add("is-active");
            if (drawerOverlay) drawerOverlay.classList.add("is-active");
            if (menuToggle) {
                menuToggle.innerHTML = `<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="white"/></svg>`;
                menuToggle.setAttribute("aria-label", "Cerrar Menú");
            }
        }

        function closeDrawer() {
            if (mobileDrawer) mobileDrawer.classList.remove("is-active");
            if (drawerOverlay) drawerOverlay.classList.remove("is-active");
            if (menuToggle) {
                menuToggle.innerHTML = `<svg viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" fill="white"/></svg>`;
                menuToggle.setAttribute("aria-label", "Abrir Menú");
            }
        }

        if (menuToggle) {
            menuToggle.addEventListener("click", (e) => {
                e.stopPropagation();
                e.preventDefault();
                const isOpen = mobileDrawer && mobileDrawer.classList.contains("is-active");
                if (isOpen) {
                    closeDrawer();
                } else {
                    openDrawer();
                }
            });
        }

        // Cierre táctil cuando se toca el fondo oscuro (overlay)
        if (drawerOverlay) {
            drawerOverlay.addEventListener("click", (e) => {
                e.stopPropagation();
                closeDrawer();
            });
        }

        // Evitar que toques dentro del menú lateral lo cierren accidentalmente
        if (mobileDrawer) {
            mobileDrawer.addEventListener("click", (e) => {
                e.stopPropagation();
            });
        }

        // Respaldo global para cerrar al hacer clic fuera del panel
        document.addEventListener("click", (e) => {
            if (mobileDrawer && mobileDrawer.classList.contains("is-active")) {
                if (!mobileDrawer.contains(e.target) && menuToggle && !menuToggle.contains(e.target)) {
                    closeDrawer();
                }
            }
        });

        // ==========================================
        // LÓGICA PWA CROSS-PLATFORM (INSTALACIÓN DE APP)
        // ==========================================
        let deferredInstallPrompt = null;
        const installAppBtn = document.getElementById("installAppBtn");
        const pwaStatusModal = document.getElementById("pwaStatusModal");
        const pwaModalDynamicBody = document.getElementById("pwaModalDynamicBody");

        window.addEventListener("beforeinstallprompt", (e) => {
            e.preventDefault();
            deferredInstallPrompt = e;
            console.log("PWA: Evento de instalación nativo disponible.");
            updateInstallButtonState();
        });

        function isRunningStandalone() {
            return (window.matchMedia('(display-mode: standalone)').matches) || 
                   (window.navigator.standalone === true);
        }

        function isIOSDevice() {
            return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                   (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        }

        function updateInstallButtonState() {
            if (!installAppBtn) return;
            if (isRunningStandalone()) {
                installAppBtn.innerHTML = `
                    <svg viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" fill="currentColor"/></svg>
                    <span>App Instalada ✓</span>
                `;
                installAppBtn.style.opacity = "0.9";
                installAppBtn.style.background = "rgba(255, 255, 255, 0.25)";
            }
        }

        function closePwaStatusModal() {
            if (pwaStatusModal) {
                pwaStatusModal.classList.remove("is-active");
            }
        }

        function showPwaStatusModal(mode) {
            if (!pwaStatusModal || !pwaModalDynamicBody) return;
            const isEn = document.documentElement.lang === "en";

            let html = "";
            if (mode === "installed") {
                html = `
                    <img src="${isEn ? '../' : ''}ImagenesWeb/Optimizadas/logo_con_circulo.webp" alt="Boda M&M" class="pwa-modal-badge" onerror="this.src='${isEn ? '../' : ''}ImagenesWeb/logo_solid.png'">
                    <h3 style="font-family: 'Bodoni Moda', serif; font-size: 1.35rem; margin: 0 0 8px 0; color: var(--olivo-base);">${isEn ? "Official App Installed! ✨" : "¡App Oficial Instalada! ✨"}</h3>
                    <p style="font-size: 0.88rem; color: #555; margin: 0 0 16px 0; line-height: 1.5;">
                        ${isEn ? "You already have the wedding shortcut ready on your home screen." : "Ya estás disfrutando del acceso directo exclusivo de la boda en tu pantalla de inicio."}
                    </p>
                    <div class="pwa-tip-box" style="text-align: center; margin-bottom: 16px;">
                        <span>📱 ${isEn ? "You have the itinerary, RSVP, mini-games, and photos just one tap away with no browser bars." : "Tienes el itinerario, confirmación, minijuegos y fotos a un toque de distancia sin barras de navegador."}</span>
                    </div>
                    <button class="pwa-btn-action" onclick="closePwaStatusModal()">${isEn ? "Continue Browsing!" : "¡Continuar Navegando!"}</button>
                `;
            } else if (mode === "ios") {
                html = `
                    <img src="${isEn ? '../' : ''}ImagenesWeb/Optimizadas/logo_con_circulo.webp" alt="Boda M&M" class="pwa-modal-badge" onerror="this.src='${isEn ? '../' : ''}ImagenesWeb/logo_solid.png'">
                    <h3 style="font-family: 'Bodoni Moda', serif; font-size: 1.35rem; margin: 0 0 6px 0; color: var(--olivo-base);">${isEn ? "Install The Wedding App" : "Instalar App de los Chicos"}</h3>
                    <p style="font-size: 0.85rem; color: #666; margin: 0 0 16px 0; line-height: 1.4;">
                        ${isEn ? "Add this direct access to your iPhone's home screen:" : "Agrega el acceso directo exclusivo a la pantalla de inicio de tu iPhone:"}
                    </p>

                    <div class="pwa-step">
                        <div class="pwa-step-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                        </div>
                        <div>
                            <strong>${isEn ? "1. Tap Share" : "1. Toca Compartir"}</strong><br>
                            ${isEn ? "In Safari's bottom bar, tap the share icon (square with an arrow pointing up)." : "En la barra inferior de Safari, presiona el botón del recuadro con la flecha arriba."}
                        </div>
                    </div>

                    <div class="pwa-step">
                        <div class="pwa-step-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                        </div>
                        <div>
                            <strong>${isEn ? "2. Add to Home Screen" : "2. Añadir a pantalla de inicio"}</strong><br>
                            ${isEn ? "Scroll down through the options and tap <em>\"Add to Home Screen\"</em>." : "Desliza hacia abajo en las opciones y presiona <em>\"Añadir a pantalla de inicio\"</em>."}
                        </div>
                    </div>

                    <div class="pwa-tip-box">
                        <strong>💡 ${isEn ? "Did you already add it?" : "¿Ya la habías instalado antes?"}</strong><br>
                        ${isEn ? "If you previously added it, just find it on your home screen with the wedding icon to open it directly!" : "Si ya la añadiste previamente a tu iPhone, ¡simplemente búscala en tu pantalla de inicio con el icono de los chicos para abrirla directo!"}
                    </div>

                    <button class="pwa-btn-action" onclick="closePwaStatusModal()">${isEn ? "Got it!" : "¡Entendido!"}</button>
                `;
            } else {
                html = `
                    <img src="${isEn ? '../' : ''}ImagenesWeb/Optimizadas/logo_con_circulo.webp" alt="Boda M&M" class="pwa-modal-badge" onerror="this.src='${isEn ? '../' : ''}ImagenesWeb/logo_solid.png'">
                    <h3 style="font-family: 'Bodoni Moda', serif; font-size: 1.35rem; margin: 0 0 6px 0; color: var(--olivo-base);">${isEn ? "Install The Wedding App" : "Instalar App de los Chicos"}</h3>
                    <p style="font-size: 0.85rem; color: #666; margin: 0 0 16px 0; line-height: 1.4;">
                        ${isEn ? "Add this shortcut to open the wedding site just like a native app:" : "Agrega el acceso directo para abrir la boda como una app nativa:"}
                    </p>

                    <div class="pwa-step">
                        <div class="pwa-step-icon">
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5z"/></svg>
                        </div>
                        <div>
                            <strong>${isEn ? "On Android" : "En Celular Android"}</strong><br>
                            ${isEn ? "Tap the three dots (⋮) in the top right corner and tap <em>\"Install app\"</em> or <em>\"Add to Home screen\"</em>." : "Toca los tres puntos (⋮) arriba a la derecha y selecciona <em>\"Instalar aplicación\"</em> o <em>\"Añadir a pantalla de inicio\"</em>."}
                        </div>
                    </div>

                    <div class="pwa-step">
                        <div class="pwa-step-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                        </div>
                        <div>
                            <strong>${isEn ? "On Desktop" : "En Computadora"}</strong><br>
                            ${isEn ? "Click the ⊕ or install icon on the right side of the address bar." : "Haz clic en el icono ⊕ o de instalación situado a la derecha de la barra de direcciones."}
                        </div>
                    </div>

                    <button class="pwa-btn-action" onclick="closePwaStatusModal()">${isEn ? "Got it!" : "¡Entendido!"}</button>
                `;
            }

            pwaModalDynamicBody.innerHTML = html;
            pwaStatusModal.classList.add("is-active");
        }

        async function handleInstallApp() {
            closeDrawer();

            // 1. Si la app ya corre en modo standalone
            if (isRunningStandalone()) {
                setTimeout(() => showPwaStatusModal("installed"), 220);
                return;
            }

            // 2. Si es Android o navegador con prompt nativo directo
            if (deferredInstallPrompt) {
                deferredInstallPrompt.prompt();
                const choiceResult = await deferredInstallPrompt.userChoice;
                if (choiceResult.outcome === "accepted") {
                    console.log("El usuario aceptó la instalación.");
                }
                deferredInstallPrompt = null;
                return;
            }

            // 3. Si es iPhone o iPad
            if (isIOSDevice()) {
                setTimeout(() => showPwaStatusModal("ios"), 220);
                return;
            }

            // 4. En cualquier otro dispositivo / navegador
            setTimeout(() => showPwaStatusModal("other"), 220);
        }

        window.addEventListener("appinstalled", () => {
            console.log("PWA instalada exitosamente por el usuario.");
            deferredInstallPrompt = null;
            updateInstallButtonState();
        });

        // Verificar estado al cargar
        updateInstallButtonState();

        // Contador en tiempo real: Sábado 13 de Febrero de 2027 a las 3:00 PM (Hora local Puebla, UTC-6)
        const targetDate = new Date("2027-02-13T15:00:00-06:00").getTime();
        function updateTimer() {
            const now = new Date().getTime();
            const diff = targetDate - now;
            if (diff > 0) {
                document.getElementById("days").innerText = Math.floor(diff / (1000 * 60 * 60 * 24));
                document.getElementById("hours").innerText = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                document.getElementById("minutes").innerText = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                document.getElementById("seconds").innerText = Math.floor((diff % (1000 * 60)) / 1000);
            } else {
                document.getElementById("days").innerText = "0";
                document.getElementById("hours").innerText = "0";
                document.getElementById("minutes").innerText = "0";
                document.getElementById("seconds").innerText = "0";
            }
        }
        setInterval(updateTimer, 1000);
        updateTimer();

        // Función para descargar el archivo .ics para Apple Calendar (iOS)
        function downloadICS() {
            const isEn = document.documentElement.lang === "en";
            const summary = isEn ? "Mariana & Memo's Wedding" : "Boda Mariana & Memo";
            const description = isEn 
                ? "We are getting married! Join us in celebrating our special day in Cholula, Puebla. Find all the details on our wedding website: https://bodadeloschicos.com/en/" 
                : "¡Nos casamos! Te invitamos a celebrar junto a nosotros este día tan especial en Cholula, Puebla. Conoce todos los detalles en nuestra página web: https://bodadeloschicos.com/";
            const location = isEn 
                ? "Ceremony at Parroquia de San Andrés Apóstol / Reception at Hacienda San José Actipan" 
                : "Ceremonia en Parroquia de San Andrés Apóstol / Recepción en Hacienda San José Actipan";

            const icsContent = [
                "BEGIN:VCALENDAR",
                "VERSION:2.0",
                "PRODID:-//Boda Mariana y Memo//NONSGML v1.0//MX",
                "CALSCALE:GREGORIAN",
                "BEGIN:VEVENT",
                "DTSTART:20270213T210000Z", // 15:00 CST en formato UTC
                "DTEND:20270214T053000Z",   // 23:30 CST en formato UTC
                `SUMMARY:${summary}`,
                `DESCRIPTION:${description}`,
                `LOCATION:${location}`,
                "END:VEVENT",
                "END:VCALENDAR"
            ].join("\r\n");

            const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8;" });
            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            link.setAttribute("download", "Boda_Mariana_y_Memo.ics");
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        // Control del carrusel
        let currentSlide = 0;
        const track = document.getElementById('carouselTrack');
        function moveSlide(d) {
            currentSlide = (currentSlide + d + track.children.length) % track.children.length;
            track.style.transform = `translateX(-${currentSlide * 100}%)`;
        }

        // ELEMENTOS DEL VISOR DE IMÁGENES (Creados dinámicamente con botones de navegación)
        const lightbox = document.createElement("div");
        lightbox.className = "lightbox-modal";
        lightbox.innerHTML = `
            <span class="lightbox-close">&times;</span>
            <button class="lightbox-btn lightbox-btn-prev" id="lightboxPrev">&#10094;</button>
            <div id="lightboxTrack" style="display: flex; height: 100%; width: 100%; align-items: center; transition: transform 0.4s ease-out; cursor: grab; will-change: transform;"></div>
            <button class="lightbox-btn lightbox-btn-next" id="lightboxNext">&#10095;</button>
        `;
        document.body.appendChild(lightbox);

        const lightboxTrack = document.getElementById("lightboxTrack");
        const btnPrev = document.getElementById("lightboxPrev");
        const btnNext = document.getElementById("lightboxNext");

        // Cambiar de foto dentro del visor usando el Track
        function changeGuestImage(direction) {
            if (guestImages.length === 0) return;
            currentGuestImageIndex = (currentGuestImageIndex + direction + guestImages.length) % guestImages.length;
            lightboxTrack.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
            lightboxTrack.style.transform = `translateX(-${currentGuestImageIndex * 100}vw)`;
        }

        // Navegación mediante clics en las flechas del lightbox
        btnPrev.addEventListener("click", (e) => {
            e.stopPropagation(); // Evita que se cierre el visor al hacer clic en la flecha
            changeGuestImage(-1);
        });

        // Evento para cambiar de foto con el botón "Siguiente"
        btnNext.addEventListener("click", (e) => {
            e.stopPropagation(); // Evita que se cierre el visor al hacer clic en la flecha
            changeGuestImage(1);
        });

        // Cerrar visor al hacer clic fuera de la foto o botones
        lightbox.addEventListener("click", (e) => {
            if (!e.target.closest('.lightbox-content') && !e.target.closest('.lightbox-btn')) {
                lightbox.classList.remove("active");
                setTimeout(() => { lightbox.style.display = "none"; }, 300);
            }
        });

        
        // Swipe logic for Lightbox (Arrastre dinámico suave)
        let lbIsDragging = false;
        let lbStartPos = 0;
        let lbCurrentTranslate = 0;

        function getLbPositionX(e) {
            return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
        }

        lightbox.addEventListener('touchstart', lbTouchStart, {passive: true});
        lightbox.addEventListener('touchend', lbTouchEnd);
        lightbox.addEventListener('touchmove', lbTouchMove, {passive: false});
        lightbox.addEventListener('mousedown', lbTouchStart);
        lightbox.addEventListener('mouseup', lbTouchEnd);
        lightbox.addEventListener('mouseleave', () => { if (lbIsDragging) lbTouchEnd(); });
        lightbox.addEventListener('mousemove', lbTouchMove);

        function lbTouchStart(e) {
            if (e.target.closest('.lightbox-btn') || e.target.closest('.lightbox-close')) return;
            lbIsDragging = true;
            lbStartPos = getLbPositionX(e);
            lbPrevTranslate = -currentGuestImageIndex * window.innerWidth;
            lightboxTrack.style.transition = 'none';
        }

        function lbTouchMove(e) {
            if (!lbIsDragging) return;
            const diff = getLbPositionX(e) - lbStartPos;
            if (Math.abs(diff) > 5) {
                if (e.cancelable) e.preventDefault();
            }
            lbCurrentTranslate = lbPrevTranslate + diff;
            lightboxTrack.style.transform = `translateX(${lbCurrentTranslate}px)`;
        }

        function lbTouchEnd() {
            if (!lbIsDragging) return;
            lbIsDragging = false;
            const diff = lbCurrentTranslate - lbPrevTranslate;
            
            if (diff < -50) {
                changeGuestImage(1);
            } else if (diff > 50) {
                changeGuestImage(-1);
            } else {
                changeGuestImage(0); // Snap back
            }
        }

        // Soporte de navegación mediante teclas de dirección físicas (Izquierda / Derecha / Escape)
        document.addEventListener("keydown", (e) => {
            if (lightbox.classList.contains("active")) {
                if (e.key === "ArrowLeft") {
                    changeGuestImage(-1);
                } else if (e.key === "ArrowRight") {
                    changeGuestImage(1);
                } else if (e.key === "Escape") {
                    lightbox.classList.remove("active");
                    setTimeout(() => { lightbox.style.display = "none"; }, 300);
                }
            }
        });

        // DETECCIÓN DINÁMICA DE INTERSECCIÓN PARA EFECTO FADE-IN AL HACER SCROLL
        document.addEventListener("DOMContentLoaded", () => {
            const fadeSections = document.querySelectorAll(".fade-in-section");
            const observerOptions = {
                root: null, // Viewport del navegador
                threshold: 0.1, // Activa cuando el 10% de la sección es visible
                rootMargin: "0px 0px -50px 0px" // Margen inferior para activar ligeramente antes de que entre
            };
            const observer = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        obs.unobserve(entry.target);
                    }
                });
            }, observerOptions);

            fadeSections.forEach(section => {
                observer.observe(section);
            });
        });

        // CONTROL DE PREGUNTAS FRECUENTES (FAQ) - COMPORTAMIENTO DE ACORDEÓN INTERACTIVO
        document.querySelectorAll('.faq-question').forEach(button => {
            button.addEventListener('click', () => {
                const item = button.parentElement;
                const answer = item.querySelector('.faq-answer');
                const isOpen = item.classList.contains('is-open');

                document.querySelectorAll('.faq-item').forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('is-open');
                        otherItem.querySelector('.faq-answer').style.maxHeight = null;
                    }
                });

                if (isOpen) {
                    item.classList.remove('is-open');
                    answer.style.maxHeight = null;
                } else {
                    item.classList.add('is-open');
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                }
            });
        });

        // GALERÍA AUTOMÁTICA DESDE GITHUB
        async function loadGithubGallery() {
            const username = "memogrinan"; 
            const repo = "bodadeloschicos";           
            const folder = "FotosBodaInvitados";
            
            const url = `https://api.github.com/repos/${username}/${repo}/contents/${folder}`;
            const container = document.getElementById("galleryGrid");
            
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    container.innerHTML = "<p style='grid-column: 1 / -1; color: #888; font-size: 0.85rem; font-style: italic;'>Las fotos compartidas por los invitados se mostrarán aquí de forma automática.</p>";
                    return;
                }
                
                const files = await response.json();
                container.innerHTML = ""; 
                
                const imageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
                const images = files.filter(file => 
                    file.type === "file" && 
                    imageExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
                );
                
                if (images.length === 0) {
                    container.innerHTML = "<p style='grid-column: 1 / -1; color: #888; font-size: 0.85rem; font-style: italic;'>Las fotos compartidas por los invitados se mostrarán aquí de forma automática.</p>";
                    return;
                }

                guestImages = images.map(img => img.download_url);

                // GENERAR TRACK DEL LIGHTBOX ANTES DE ITERAR
                const lightboxTrack = document.getElementById("lightboxTrack");
                lightboxTrack.innerHTML = "";
                
                images.forEach((img, index) => {
                    const itemEl = document.createElement("div");
                    itemEl.className = "gallery-item";

                    const imgEl = document.createElement("img");
                    imgEl.src = img.download_url;
                    imgEl.alt = "Foto compartida";
                    
                    imgEl.addEventListener("click", () => {
                        currentGuestImageIndex = index;
                        lightboxTrack.style.transition = 'none';
                        lightboxTrack.style.transform = `translateX(-${currentGuestImageIndex * 100}vw)`;
                        lightbox.style.display = "flex";
                        setTimeout(() => { lightbox.classList.add("active"); }, 10);
                    });

                    itemEl.appendChild(imgEl);

                    // --- GENERAR SLIDE PARA EL LIGHTBOX ---
                    const slide = document.createElement("div");
                    slide.style.cssText = "min-width: 100vw; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center;";
                    
                    const lbImg = document.createElement("img");
                    lbImg.src = img.download_url;
                    lbImg.className = "lightbox-content";
                    lbImg.loading = "eager";
                    slide.appendChild(lbImg);

                    const filename = img.name;
                    if (filename.includes("-De-")) {
                        const parts = filename.split("-De-");
                        if (parts.length > 1) {
                            const rawName = parts[1].split("-")[0];
                            const cleanName = rawName.replace(/_/g, " "); 
                            
                            if (cleanName && cleanName.toLowerCase() !== "anonimo") {
                                // Caption en la galeria miniatura
                                const textEl = document.createElement("div");
                                textEl.className = "gallery-caption";
                                textEl.innerText = cleanName;
                                itemEl.appendChild(textEl);
                                
                                // Caption en el lightbox
                                const lbText = document.createElement("p");
                                lbText.innerText = `Subida por: ${cleanName}`;
                                lbText.style.cssText = "color: rgba(255,255,255,0.9); font-family: 'Montserrat', sans-serif; font-size: 0.95rem; margin-top: 15px; letter-spacing: 0.5px;";
                                slide.appendChild(lbText);
                            }
                        }
                    }
                    lightboxTrack.appendChild(slide);
                    // ----------------------------------------

                    container.appendChild(itemEl);
                });
            } catch (error) {
                console.error("Error al cargar la galería de GitHub:", error);
                container.innerHTML = "<p style='grid-column: 1 / -1; color: #888; font-size: 0.85rem; font-style: italic;'>Las fotos compartidas por los invitados se mostrarán aquí de forma automática.</p>";
            }
        }
        
        document.addEventListener("DOMContentLoaded", loadGithubGallery);

        // ==========================================
        // SISTEMA DE CONFIRMACIÓN RSVP DIVERSIFICADO (GOOGLE SHEETS)
        // ==========================================

        const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwzF6-fMJJeXgOj3djFSm_vo1ZEteYRIj0PFXXhq_4q7eLcoCVmuTNRcKto2GSR-G8XSQ/exec";
        let currentRSVPData = null;

        document.addEventListener("DOMContentLoaded", () => {
            const urlParams = new URLSearchParams(window.location.search);
            const partyId = urlParams.get("id") || urlParams.get("p") || urlParams.get("invitado") || localStorage.getItem("bodachicos_party_id");
            if (partyId) {
                fetchRSVPData(partyId);
            }
        });

        function searchRSVPInvitation() {
            const val = document.getElementById("rsvpSearchInput").value.trim().toLowerCase().replace(/\s+/g, "-");
            if (!val) return;
            fetchRSVPData(val, true);
        }

        async function fetchRSVPData(id, autoScroll = false) {
            document.getElementById("rsvpSearchContainer").style.display = "none";
            document.getElementById("rsvpFormContainer").style.display = "none";
            document.getElementById("rsvpSuccessContainer").style.display = "none";
            document.getElementById("rsvpLoadingContainer").style.display = "block";
            document.getElementById("rsvpSearchError").style.display = "none";

            try {
                const res = await fetch(`${APPS_SCRIPT_URL}?id=${encodeURIComponent(id)}`);
                const data = await res.json();

                // COMPENSACIÓN MATEMÁTICA ANTI-LAYOUT SHIFT:
                // Solo compensar si el usuario ya alcanzó o superó la sección de Itinerario.
                // Si todavía no llega a Itinerario (está en Inicio, Historia o Lugar),
                // el DOM inferior no afecta en lo absoluto su pantalla y NUNCA se debe alterar el scroll:
                const itinerarioEl = document.getElementById("itinerario");
                const isPastItinerary = itinerarioEl ? (itinerarioEl.getBoundingClientRect().top <= 100) : false;

                const hashTarget = (window.location.hash && window.location.hash !== "#inicio")
                    ? document.querySelector(window.location.hash)
                    : null;
                const anchorEl = isPastItinerary
                    ? (hashTarget || (window.scrollY > 150 ? document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 3) : null))
                    : null;
                const prevTop = anchorEl ? anchorEl.getBoundingClientRect().top : 0;

                if (data.status === "success") {
                    currentRSVPData = data;
                    const hasAnswered = (data.estadoSabado && data.estadoSabado.toString().trim() !== "");
                    if (hasAnswered) {
                        renderRSVPSummaryView(data);
                    } else {
                        renderRSVPForm(data);
                    }
                } else {
                    document.getElementById("rsvpLoadingContainer").style.display = "none";
                    document.getElementById("rsvpSearchContainer").style.display = "block";
                    const isEn = document.documentElement.lang === "en";
                    const errEl = document.getElementById("rsvpSearchError");
                    errEl.innerText = isEn 
                        ? `We couldn't find an invitation matching '${id}'. Please verify and try again.` 
                        : `No encontramos una invitación con la clave '${id}'. Por favor verifica e intenta de nuevo.`;
                    errEl.style.display = "block";
                }

                // Si cualquier elemento superior (Itinerario, RSVP, etc.) creció o cambió de tamaño,
                // compensamos sincrónicamente la diferencia exacta para que la pantalla no se mueva:
                if (anchorEl) {
                    const newTop = anchorEl.getBoundingClientRect().top;
                    const delta = newTop - prevTop;
                    if (delta !== 0) {
                        window.scrollBy(0, delta);
                    }
                }
                
                // Solo si el usuario hizo clic manual en "Buscar", enfocar suavemente la tarjeta de RSVP:
                if (autoScroll) {
                    setTimeout(() => {
                        const target = document.getElementById("confirmacion");
                        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }, 50);
                }
            } catch (err) {
                console.error("Error al obtener RSVP:", err);
                const isEn = document.documentElement.lang === "en";
                document.getElementById("rsvpLoadingContainer").style.display = "none";
                document.getElementById("rsvpSearchContainer").style.display = "block";
                const errEl = document.getElementById("rsvpSearchError");
                errEl.innerText = isEn 
                    ? "An error occurred while connecting to the guest list. Please try again." 
                    : "Ocurrió un error al conectar con la lista de invitados. Intenta de nuevo.";
                errEl.style.display = "block";
            }
        }

        function renderRSVPSummaryView(data) {
            const isEn = document.documentElement.lang === "en";
            document.getElementById("rsvpLoadingContainer").style.display = "none";
            document.getElementById("rsvpFormContainer").style.display = "none";
            
            const successContainer = document.getElementById("rsvpSuccessContainer");
            successContainer.style.display = "block";

            const isCivil = (data.invitaCivil && data.invitaCivil.toString().trim().toUpperCase() === "SI");
            const integrantes = data.integrantes ? data.integrantes.toString().split(",").map(s => s.trim()) : [data.nombre];

            // Placeholder del input de celebración especial
            const celebracionInput = document.getElementById("rsvpCelebracionInput");
            if (celebracionInput) {
                celebracionInput.placeholder = isEn 
                    ? "E.g., A birthday or wedding anniversary..." 
                    : "Ej. Cumpleaños o aniversario de bodas...";
            }

            // CONTROL DEL ITINERARIO: Mostrar el Viernes 12 de Febrero en el Itinerario SOLO a invitados a la boda civil
            const itinFriday = document.getElementById("itineraryFridayBlock");
            if (itinFriday) {
                itinFriday.style.display = isCivil ? "block" : "none";
            }

            // Mapeo amigable para el resumen en inglés o español
            const formatStatusText = (statusStr) => {
                if (!statusStr) return isEn ? 'No response' : 'Sin respuesta';
                return statusStr.split(' | ').map(item => {
                    if (isEn) {
                        return item.replace(/:\s*SI\b/gi, ': Attending ✓').replace(/:\s*NO\b/gi, ': Not attending ✗');
                    } else {
                        return item.replace(/:\s*SI\b/gi, ': Sí asistirá ✓').replace(/:\s*NO\b/gi, ': No asistirá ✗');
                    }
                }).join('<br>');
            };

            let summaryHTML = `
                <span style="font-size: 3.2rem; display: inline-block;">🎉</span>
                <h3 style="color: var(--olivo-base); font-size: 1.5rem; font-weight: 600; margin: 10px 0 4px 0;">${isEn ? "Response Received!" : "¡Respuesta Registrada!"}</h3>
                <p style="color: #666; font-size: 0.9rem; margin-bottom: 20px;">${isEn ? `Hello <strong>${data.nombre}</strong>, we have received your official confirmation.` : `Hola <strong>${data.nombre}</strong>, ya recibimos tu confirmación oficial.`}</p>

                <div style="text-align: left; background: #f9faf7; padding: 18px; border-radius: 18px; border: 1px solid rgba(82, 88, 47, 0.15); margin-bottom: 20px; font-size: 0.9rem; color: #444; line-height: 1.6;">
            `;

            if (isCivil) {
                summaryHTML += `
                    <div style="margin-bottom: 14px;">
                        <h4 style="color: var(--olivo-base); font-size: 0.95rem; margin: 0 0 4px 0; font-weight: 600;">🥂 ${isEn ? "Civil Ceremony (Friday, February 12):" : "Boda Civil (Viernes 12 de Febrero):"}</h4>
                        <p style="margin: 0; padding-left: 10px; border-left: 3px solid var(--olivo-base); color: #333; font-weight: 500;">${formatStatusText(data.estadoCivil)}</p>
                    </div>
                `;
            }

            summaryHTML += `
                <div style="margin-bottom: 14px;">
                    <h4 style="color: var(--olivo-base); font-size: 0.95rem; margin: 0 0 4px 0; font-weight: 600;">💒 ${isEn ? "Wedding & Celebration (Saturday, February 13):" : "Boda & Fiesta (Sábado 13 de Febrero):"}</h4>
                    <p style="margin: 0; padding-left: 10px; border-left: 3px solid var(--olivo-base); color: #333; font-weight: 500;">${formatStatusText(data.estadoSabado)}</p>
                </div>
            `;

            // SECCIÓN RESTRICCIONES ALIMENTICIAS POR INTEGRANTE
            const alergiasSummaryLines = [];
            const alergiasMap = {};
            if (data.alergias && typeof data.alergias === 'string') {
                const parts = data.alergias.split("|").map(p => p.trim());
                parts.forEach(part => {
                    const kv = part.split(":").map(s => s.trim());
                    if (kv.length >= 2) {
                        const mName = kv[0];
                        let mVal = kv.slice(1).join(":").trim();
                        // Prevenir contaminación cruzada histórica si mVal contenía el nombre de otro integrante
                        const isCrossAssigned = integrantes.some(other => 
                            other.toLowerCase() !== mName.toLowerCase() && 
                            mVal.toLowerCase().startsWith(other.toLowerCase() + ":")
                        );
                        if (!isCrossAssigned) {
                            alergiasMap[mName.toLowerCase()] = mVal;
                        }
                    } else if (kv.length === 1 && integrantes.length === 1) {
                        alergiasMap[integrantes[0].toLowerCase()] = kv[0];
                    }
                });
            }

            integrantes.forEach(member => {
                const rawVal = alergiasMap[member.toLowerCase()] || "";
                const isNone = (!rawVal || rawVal.toLowerCase() === "ninguna" || rawVal.toLowerCase() === "n/a" || rawVal.toLowerCase() === "none" || rawVal.toLowerCase() === "nones");
                if (isNone) {
                    alergiasSummaryLines.push(`${member}: <span style="font-weight: 400; color: #777;">${isEn ? "None" : "Ninguna"}</span>`);
                } else {
                    alergiasSummaryLines.push(`${member}: <span style="font-weight: 600; color: #2b2b2b;">${rawVal}</span>`);
                }
            });

            summaryHTML += `
                <div style="margin-bottom: 14px;">
                    <h4 style="color: var(--olivo-base); font-size: 0.95rem; margin: 0 0 4px 0; font-weight: 600;">🍽️ ${isEn ? "Dietary restrictions:" : "Restricciones alimenticias:"}</h4>
                    <p style="margin: 0; padding-left: 10px; border-left: 3px solid var(--olivo-base); color: #333; font-weight: 500;">${alergiasSummaryLines.join('<br>')}</p>
                </div>
            `;

            if (data.celebracion && data.celebracion.trim() !== "") {
                summaryHTML += `
                    <div>
                        <h4 style="color: var(--olivo-base); font-size: 0.95rem; margin: 0 0 4px 0; font-weight: 600;">🎉 ${isEn ? "Special celebration:" : "Celebración especial:"}</h4>
                        <p style="margin: 0; color: #555;">${data.celebracion}</p>
                    </div>
                `;
            }

            summaryHTML += `</div>`;

            summaryHTML += `
                <button onclick="renderRSVPForm(currentRSVPData)" class="btn btn-rsvp" style="padding: 12px 24px; font-size: 0.9rem; border-radius: 14px; margin-top: 5px; width: 100%; box-sizing: border-box;">${isEn ? "Edit or update response ✏️" : "Modificar o actualizar respuesta ✏️"}</button>
            `;

            successContainer.innerHTML = summaryHTML;
        }

        function updateRSVPSubmitButtonText() {
            const submitBtn = document.getElementById("rsvpSubmitBtn");
            if (!submitBtn) return;
            const isEn = document.documentElement.lang === "en";
            const isEditing = currentRSVPData && (currentRSVPData.estadoSabado || currentRSVPData.confirmado);
            if (isEditing) {
                submitBtn.innerText = isEn ? "Save Changes 💌" : "Guardar Cambios 💌";
            } else {
                submitBtn.innerText = isEn ? "Send RSVP 💌" : "Enviar Confirmación 💌";
            }
        }

        function parseMemberStatus(fullStr, memberName) {
            if (!fullStr) return "SI";
            const str = fullStr.toString().trim();
            if (str.toUpperCase() === "SI") return "SI";
            if (str.toUpperCase() === "NO") return "NO";
            const parts = str.split("|").map(p => p.trim());
            for (let part of parts) {
                const kv = part.split(":").map(s => s.trim());
                if (kv.length >= 2) {
                    if (kv[0].toLowerCase() === memberName.toLowerCase() || memberName.toLowerCase().includes(kv[0].toLowerCase())) {
                        return kv[1].toUpperCase() === "NO" ? "NO" : "SI";
                    }
                }
            }
            return "SI";
        }

        function renderRSVPForm(data) {
            const isEn = document.documentElement.lang === "en";
            document.getElementById("rsvpLoadingContainer").style.display = "none";
            document.getElementById("rsvpSuccessContainer").style.display = "none";
            document.getElementById("rsvpSearchContainer").style.display = "none";
            document.getElementById("rsvpFormContainer").style.display = "block";

            document.getElementById("rsvpGuestTitle").innerText = isEn ? `Hello ${data.nombre}!` : `¡Hola ${data.nombre}!`;
            const pases = Number(data.pasesSabado) || 1;
            document.getElementById("rsvpPassesText").innerText = isEn 
                ? (pases === 1 ? `We’ve reserved 1 seat for your party.` : `We’ve reserved ${pases} seats for your party.`)
                : (pases === 1 ? `Tienes 1 pase reservado para nuestra boda.` : `Tienen ${pases} pases reservados para nuestra boda.`);

            const deadlineNotice = document.getElementById("rsvpDeadlineNotice");
            if (deadlineNotice) {
                deadlineNotice.innerText = isEn 
                    ? "Please confirm your attendance by January 12, 2027 📅" 
                    : "Favor de confirmar tu asistencia antes del 12 de enero de 2027 📅";
            }

            const integrantes = data.integrantes ? data.integrantes.toString().split(",").map(s => s.trim()) : [data.nombre];
            const isCivil = (data.invitaCivil && data.invitaCivil.toString().trim().toUpperCase() === "SI");

            // Placeholder del input de celebración especial
            const celebracionInput = document.getElementById("rsvpCelebracionInput");
            if (celebracionInput) {
                celebracionInput.placeholder = isEn 
                    ? "E.g., A birthday or wedding anniversary..." 
                    : "Ej. Cumpleaños o aniversario de bodas...";
            }

            // CONTROL DEL ITINERARIO: Mostrar el Viernes 12 de Febrero en el Itinerario SOLO a invitados a la boda civil
            const itinFriday = document.getElementById("itineraryFridayBlock");
            if (itinFriday) {
                itinFriday.style.display = isCivil ? "block" : "none";
            }

            // SECCIÓN FRIDAY (CIVIL)
            const fridaySection = document.getElementById("rsvpFridaySection");
            const fridayMembers = document.getElementById("rsvpFridayMembers");
            if (isCivil) {
                fridaySection.style.display = "block";
                fridayMembers.innerHTML = "";
                integrantes.forEach((member, idx) => {
                    const st = parseMemberStatus(data.estadoCivil, member);
                    const siChecked = (st === "SI") ? "checked" : "";
                    const noChecked = (st === "NO") ? "checked" : "";

                    const div = document.createElement("div");
                    div.style.cssText = "display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 8px; padding: 10px 14px; background: white; border-radius: 14px; border: 1px solid #eaefe0;";
                    div.innerHTML = `
                        <span style="font-size: 0.95rem; font-weight: 600; color: #333;">👤 ${member}</span>
                        <div style="display: flex; gap: 10px; font-size: 0.85rem;">
                            <label style="cursor: pointer; display: flex; align-items: center; gap: 6px; background: #f2f5eb; padding: 6px 12px; border-radius: 20px; font-weight: 600; color: #52582f;"><input type="radio" name="civil_${idx}" value="SI" ${siChecked} onchange="updateRSVPSubmitButtonText()"> ${isEn ? "Will attend" : "Sí asistirá"}</label>
                            <label style="cursor: pointer; display: flex; align-items: center; gap: 6px; background: #fbebee; padding: 6px 12px; border-radius: 20px; font-weight: 600; color: #c0392b;"><input type="radio" name="civil_${idx}" value="NO" ${noChecked} onchange="updateRSVPSubmitButtonText()"> ${isEn ? "Will not attend" : "No asistirá"}</label>
                        </div>
                    `;
                    fridayMembers.appendChild(div);
                });
            } else {
                fridaySection.style.display = "none";
            }

            // SECCIÓN SATURDAY (BODA Y FIESTA) CON CAMPO DE RESTICCIONES INDIVIDUAL EN TEXTAREA
            const saturdayMembers = document.getElementById("rsvpSaturdayMembers");
            saturdayMembers.innerHTML = "";
            integrantes.forEach((member, idx) => {
                const st = parseMemberStatus(data.estadoSabado, member);
                const siChecked = (st === "SI") ? "checked" : "";
                const noChecked = (st === "NO") ? "checked" : "";

                const div = document.createElement("div");
                div.style.cssText = "padding: 12px 14px; background: white; border-radius: 14px; border: 1px solid #eaefe0; display: flex; flex-direction: column; gap: 10px;";
                div.innerHTML = `
                    <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 8px;">
                        <span style="font-size: 0.95rem; font-weight: 600; color: #333;">👤 ${member}</span>
                        <div style="display: flex; gap: 10px; font-size: 0.85rem;">
                            <label style="cursor: pointer; display: flex; align-items: center; gap: 6px; background: #f2f5eb; padding: 6px 12px; border-radius: 20px; font-weight: 600; color: #52582f;"><input type="radio" name="sabado_${idx}" value="SI" ${siChecked} onchange="updateRSVPSubmitButtonText()"> ${isEn ? "Will attend" : "Sí asistirá"}</label>
                            <label style="cursor: pointer; display: flex; align-items: center; gap: 6px; background: #fbebee; padding: 6px 12px; border-radius: 20px; font-weight: 600; color: #c0392b;"><input type="radio" name="sabado_${idx}" value="NO" ${noChecked} onchange="updateRSVPSubmitButtonText()"> ${isEn ? "Will not attend" : "No asistirá"}</label>
                        </div>
                    </div>
                    <div>
                        <textarea id="alergia_${idx}" rows="2" placeholder="${isEn ? `Dietary restrictions for ${member} (e.g., vegetarian, shellfish allergy...)` : `Restricciones alimenticias de ${member} (ej. vegetariano, alergia a mariscos...)`}" style="width: 100%; padding: 9px 12px; border: 1px solid #e0e0e0; border-radius: 10px; font-size: 16px; outline: none; box-sizing: border-box; background: #fafafa; font-family: inherit; resize: vertical;"></textarea>
                    </div>
                `;
                saturdayMembers.appendChild(div);
            });

            // Rellenar datos existentes de alergias y celebración si ya habían respondido previamente
            if (data.alergias) {
                const parts = data.alergias.split("|").map(p => p.trim());
                parts.forEach(part => {
                    const kv = part.split(":").map(s => s.trim());
                    if (kv.length >= 2) {
                        const mName = kv[0];
                        let mVal = kv.slice(1).join(":").trim();
                        integrantes.forEach((member, idx) => {
                            if (member.toLowerCase() === mName.toLowerCase()) {
                                const input = document.getElementById(`alergia_${idx}`);
                                if (input) {
                                    // Limpiar si accidentalmente contenía el nombre de otro integrante (corrupción histórica)
                                    const isCrossAssigned = integrantes.some(other => 
                                        other.toLowerCase() !== member.toLowerCase() && 
                                        mVal.toLowerCase().startsWith(other.toLowerCase() + ":")
                                    );
                                    if (isCrossAssigned) mVal = "";

                                    // Si no tiene restricción o dice "Ninguna", DEJAR EL CAMPO COMPLETAMENTE VACÍO (no rellenar con "Ninguna")
                                    if (!mVal || mVal.toLowerCase() === "ninguna" || mVal.toLowerCase() === "n/a" || mVal.toLowerCase() === "none" || mVal.toLowerCase() === "nones") {
                                        input.value = "";
                                    } else {
                                        input.value = mVal;
                                    }
                                }
                            }
                        });
                    }
                });
            }

            if (data.celebracion) {
                document.getElementById("rsvpCelebracionInput").value = data.celebracion;
            }

            updateRSVPSubmitButtonText();
        }

        async function submitRSVPForm(e) {
            e.preventDefault();
            if (!currentRSVPData) return;

            const isEn = document.documentElement.lang === "en";
            const submitBtn = document.getElementById("rsvpSubmitBtn");
            submitBtn.disabled = true;
            submitBtn.innerText = isEn ? "Saving response... 💌" : "Guardando confirmación... 💌";

            const integrantes = currentRSVPData.integrantes ? currentRSVPData.integrantes.toString().split(",").map(s => s.trim()) : [currentRSVPData.nombre];
            const isCivil = (currentRSVPData.invitaCivil && currentRSVPData.invitaCivil.toString().trim().toUpperCase() === "SI");

            const estadoSabadoList = [];
            const estadoCivilList = [];
            const alergiasList = [];

            integrantes.forEach((member, idx) => {
                const sabVal = document.querySelector(`input[name="sabado_${idx}"]:checked`)?.value || "SI";
                estadoSabadoList.push(`${member}: ${sabVal}`);

                if (isCivil) {
                    const civVal = document.querySelector(`input[name="civil_${idx}"]:checked`)?.value || "SI";
                    estadoCivilList.push(`${member}: ${civVal}`);
                }

                const rawAlg = document.getElementById(`alergia_${idx}`)?.value.trim() || "";
                // Si el campo está vacío o dice "Ninguna", se almacena como string vacío para no ensuciar la trix
                const isNone = (!rawAlg || rawAlg.toLowerCase() === "ninguna" || rawAlg.toLowerCase() === "n/a" || rawAlg.toLowerCase() === "none" || rawAlg.toLowerCase() === "nones");
                const cleanAlg = isNone ? "" : rawAlg;
                alergiasList.push(`${member}: ${cleanAlg}`);
            });

            const celebracionVal = document.getElementById("rsvpCelebracionInput").value.trim();

            const payload = {
                id: currentRSVPData.id,
                estadoSabado: estadoSabadoList.join(" | "),
                estadoCivil: isCivil ? estadoCivilList.join(" | ") : "N/A",
                alergias: alergiasList.join(" | "),
                celebracion: celebracionVal
            };

            try {
                await fetch(APPS_SCRIPT_URL, {
                    method: "POST",
                    mode: "no-cors",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                currentRSVPData.estadoSabado = payload.estadoSabado;
                currentRSVPData.estadoCivil = payload.estadoCivil;
                currentRSVPData.alergias = payload.alergias;
                currentRSVPData.celebracion = payload.celebracion;

                renderRSVPSummaryView(currentRSVPData);

                // CELEBRACIÓN CON CONFETTI EDITORIAL (Solo si confirmaron al menos un 'SI')
                const confirmedAnyYes = (payload.estadoSabado.includes(": SI") || (isCivil && payload.estadoCivil.includes(": SI")));
                if (confirmedAnyYes) {
                    triggerRSVPConfetti();
                }
            } catch (err) {
                console.error("Error al enviar RSVP:", err);
                alert(isEn ? "There was an issue saving your response. Please try again." : "Ocurrió un inconveniente al guardar. Por favor intenta de nuevo.");
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerText = isEn ? "Confirm Attendance 💌" : "Confirmar Asistencia 💌";
            }
        }

        // Ráfaga elegante de confetti en la paleta de la boda (oro, olivo, crema, champagne)
        function triggerRSVPConfetti() {
            if (typeof confetti !== "function") return;

            const weddingPalette = ["#52582f", "#a3ad73", "#d4af37", "#f3e8c8", "#ffffff"];
            
            // Primer disparo central
            confetti({
                particleCount: 50,
                spread: 70,
                origin: { y: 0.65 },
                colors: weddingPalette,
                disableForReducedMotion: true
            });

            // Pequeños fuegos artificiales laterales suaves
            setTimeout(() => {
                confetti({
                    particleCount: 35,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0.2, y: 0.7 },
                    colors: weddingPalette,
                    disableForReducedMotion: true
                });
                confetti({
                    particleCount: 35,
                    angle: 120,
                    spread: 55,
                    origin: { x: 0.8, y: 0.7 },
                    colors: weddingPalette,
                    disableForReducedMotion: true
                });
            }, 250);
        }

        function resetRSVPView() {
            document.getElementById("rsvpSuccessContainer").style.display = "none";
            if (currentRSVPData) {
                document.getElementById("rsvpFormContainer").style.display = "block";
            } else {
                document.getElementById("rsvpSearchContainer").style.display = "block";
            }
        }

// Lógica de arrastre dinámico y auto-avance para Carrusel Principal
        const dynTrack = document.getElementById('carouselTrack');
        let dynIsDragging = false;
        let dynStartPos = 0;
        let dynCurrentTranslate = 0;
        let dynPrevTranslate = 0;
        let autoAdvanceTimer = null;

        function startAutoAdvance() {
            clearInterval(autoAdvanceTimer);
            autoAdvanceTimer = setInterval(() => {
                if (!dynIsDragging && document.visibilityState === 'visible') {
                    window.moveSlide(1); // Avanza siempre a la SIGUIENTE foto
                }
            }, 3500);
        }
        
        function resetAutoAdvance() {
            startAutoAdvance();
        }

        if (dynTrack) {
            dynTrack.addEventListener('touchstart', dynTouchStart, {passive: true});
            dynTrack.addEventListener('touchend', dynTouchEnd);
            dynTrack.addEventListener('touchmove', dynTouchMove, {passive: false});
            
            dynTrack.addEventListener('mousedown', dynTouchStart);
            dynTrack.addEventListener('mouseup', dynTouchEnd);
            dynTrack.addEventListener('mouseleave', () => { if (dynIsDragging) dynTouchEnd(); });
            dynTrack.addEventListener('mousemove', dynTouchMove);
            
            startAutoAdvance();
        }

        function getDynPositionX(e) {
            return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
        }

        function dynTouchStart(e) {
            if (e.target.closest('button') || e.target.closest('a')) return;
            dynIsDragging = true;
            dynStartPos = getDynPositionX(e);
            dynPrevTranslate = -currentSlide * dynTrack.clientWidth;
            dynTrack.style.transition = 'none';
            clearInterval(autoAdvanceTimer);
        }

        function dynTouchMove(e) {
            if (!dynIsDragging) return;
            const diff = getDynPositionX(e) - dynStartPos;
            if (Math.abs(diff) > 5 && e.cancelable) { e.preventDefault(); }
            dynCurrentTranslate = dynPrevTranslate + diff;
            dynTrack.style.transform = `translateX(${dynCurrentTranslate}px)`;
        }

        function dynTouchEnd() {
            if (!dynIsDragging) return;
            dynIsDragging = false;
            const movedBy = dynCurrentTranslate - dynPrevTranslate;
            dynTrack.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
            
            if (movedBy < -50) {
                currentSlide = (currentSlide + 1) % dynTrack.children.length;
            } else if (movedBy > 50) {
                currentSlide = (currentSlide - 1 + dynTrack.children.length) % dynTrack.children.length;
            }
            
            dynTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
            resetAutoAdvance();
        }
        
        window.moveSlide = function(d) {
            currentSlide = (currentSlide + d + dynTrack.children.length) % dynTrack.children.length;
            dynTrack.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
            dynTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
            resetAutoAdvance();
        }

document.addEventListener("DOMContentLoaded", () => {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('pago') === 'exito') {
                // Remove the URL param cleanly
                window.history.replaceState({}, document.title, "/");
                
                // Create overlay
                const successOverlay = document.createElement("div");
                successOverlay.style.position = "fixed";
                successOverlay.style.top = "0";
                successOverlay.style.left = "0";
                successOverlay.style.width = "100%";
                successOverlay.style.height = "100%";
                successOverlay.style.backgroundColor = "rgba(0,0,0,0.85)";
                successOverlay.style.zIndex = "3000";
                successOverlay.style.display = "flex";
                successOverlay.style.justifyContent = "center";
                successOverlay.style.alignItems = "center";
                successOverlay.style.opacity = "0";
                successOverlay.style.transition = "opacity 0.4s ease";
                
                // Create modal
                const successModal = document.createElement("div");
                successModal.style.backgroundColor = "var(--crema-fondo)";
                successModal.style.padding = "40px";
                successModal.style.borderRadius = "20px";
                successModal.style.textAlign = "center";
                successModal.style.maxWidth = "400px";
                successModal.style.width = "90%";
                successModal.style.boxShadow = "0 20px 40px rgba(0,0,0,0.3)";
                successModal.style.transform = "scale(0.8)";
                successModal.style.transition = "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
                
                successModal.innerHTML = `
                    <div style="font-size: 60px; margin-bottom: 10px;">✨</div>
                    <h2 style="font-family: 'Prata', serif; color: var(--olivo-base); margin-bottom: 15px;">¡Regalo Enviado!</h2>
                    <p style="font-size: 1.1rem; color: #444; line-height: 1.6; margin-bottom: 25px;">Muchas gracias por tu aportación y tu mensaje.<br>¡Nos vemos en la boda!</p>
                    <button id="closeSuccessBtn" style="background-color: var(--olivo-base); color: white; border: none; padding: 12px 30px; border-radius: 30px; font-weight: 600; cursor: pointer; font-size: 1rem;">Cerrar</button>
                `;
                
                successOverlay.appendChild(successModal);
                document.body.appendChild(successOverlay);
                
                // Animate in
                setTimeout(() => {
                    successOverlay.style.opacity = "1";
                    successModal.style.transform = "scale(1)";
                }, 100);
                
                // Close logic
                document.getElementById("closeSuccessBtn").addEventListener("click", () => {
                    successOverlay.style.opacity = "0";
                    successModal.style.transform = "scale(0.8)";
                    setTimeout(() => successOverlay.remove(), 400);
                });
            }
        });

// ¡IMPORTANTE! Reemplaza esta URL con la URL final de tu Worker
        // Ej: https://bodadeloschicos-fotos.tudominio.workers.dev
        const WORKER_URL = "https://bodadeloschicos-fotos.memoge55.workers.dev";

        async function uploadFotosR2() {
            const guestNameInput = document.getElementById("r2GuestName").value.trim();
            const fileInput = document.getElementById("r2FileInput");
            const statusEl = document.getElementById("r2UploadStatus");
            const btn = document.getElementById("r2UploadBtn");

            if (!guestNameInput) {
                alert("¡Por favor ingresa tu nombre de paparazzi primero!");
                return;
            }
            if (fileInput.files.length === 0) {
                alert("¡Selecciona al menos una foto para subir!");
                return;
            }

            statusEl.style.display = "block";
            btn.disabled = true;

            const files = Array.from(fileInput.files);
            let uploadedCount = 0;

            const options = {
                maxSizeMB: 0.3, // 300KB
                maxWidthOrHeight: 1080,
                useWebWorker: true,
                fileType: "image/webp"
            };

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                statusEl.innerText = `Comprimiendo y subiendo foto ${i + 1} de ${files.length}...`;

                try {
                    // Comprimir para crear el Thumbnail
                    const compressedBlob = await imageCompression(file, options);
                    const thumbFile = new File([compressedBlob], file.name.replace(/\.[^/.]+$/, "") + ".webp", { type: "image/webp" });

                    // Preparar la carga útil
                    const formData = new FormData();
                    formData.append("guestName", guestNameInput);
                    formData.append("original", file);
                    formData.append("thumb", thumbFile);

                    // Enviar al Worker
                    const response = await fetch(`${WORKER_URL}/api/upload`, {
                        method: "POST",
                        body: formData
                    });

                    if (response.ok) {
                        uploadedCount++;
                    } else {
                        console.error("Error al subir foto", await response.text());
                    }
                } catch (error) {
                    console.error("Error comprimiendo/subiendo", error);
                }
            }

            statusEl.innerText = `¡Éxito! Se subieron ${uploadedCount} fotos correctamente.`;
            statusEl.style.color = "green";
            fileInput.value = ""; // Limpiar input
            btn.disabled = false;
            
            // Recargar la galería después de 2 segundos
            setTimeout(() => {
                statusEl.style.display = "none";
                statusEl.style.color = "#555";
                loadR2Gallery();
            }, 2000);
        }





    

        // ==========================================
        // LÓGICA DE CHICOSGRAM (FANCYBOX)
        // ==========================================
        function toggleClearPhotosBtn() {
            const input = document.getElementById("cgFileInput");
            const btn = document.getElementById("cgClearPhotosBtn");
            const labelText = document.getElementById("cgFileText");
            const isEn = document.documentElement.lang === "en";

            if (input.files && input.files.length > 0) {
                if (input.files.length > 10) {
                    showCGError(isEn ? "To keep uploads fast and avoid freezing your phone, please select up to 10 photos at a time 📸" : "Para que suban rápido y no sature tu celular, selecciona máximo 10 fotos por turno 📸");
                    input.value = "";
                    btn.style.display = "none";
                    labelText.innerText = isEn ? "Choose photos..." : "Elegir fotos...";
                    return;
                }
                btn.style.display = "flex";
                labelText.innerText = isEn 
                    ? `${input.files.length} photo(s) selected` 
                    : `${input.files.length} foto(s) seleccionada(s)`;
            } else {
                btn.style.display = "none";
                labelText.innerText = isEn ? "Choose photos..." : "Elegir fotos...";
            }
        }

        function clearSelectedPhotos() {
            const input = document.getElementById("cgFileInput");
            input.value = ""; // Limpia el selector
            toggleClearPhotosBtn(); // Oculta el tache
        }
        
        function showCGError(msg) {
            const err = document.getElementById("cgErrorAlert");
            err.innerText = msg;
            err.style.display = "block";
            setTimeout(() => { err.style.display = "none"; }, 5000);
        }

        async function uploadFotosCG() {
            const guestNameInput = document.getElementById("cgGuestName").value.trim();
            const fileInput = document.getElementById("cgFileInput");
            const statusEl = document.getElementById("cgUploadStatus");
            const btn = document.getElementById("cgUploadBtn");
            const isEn = document.documentElement.lang === "en";

            if (!guestNameInput) { showCGError(isEn ? "Please enter your Paparazzi name!" : "¡Falta tu nombre de Paparazzi!"); return; }
            if (fileInput.files.length === 0) { showCGError(isEn ? "Select at least one photo to share!" : "¡Selecciona al menos una foto para publicar!"); return; }
            if (fileInput.files.length > 10) { 
                showCGError(isEn ? "To keep uploads fast and avoid freezing your phone, upload up to 10 photos at a time 📸" : "Para que suban rápido y no sature tu celular, sube hasta 10 fotos por turno 📸"); 
                return; 
            }

            statusEl.style.display = "block";
            btn.disabled = true;

            const files = Array.from(fileInput.files);
            let uploadedCount = 0;

            const options = { maxSizeMB: 0.3, maxWidthOrHeight: 1080, useWebWorker: true, fileType: "image/webp" };

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                statusEl.innerText = isEn 
                    ? `Publishing photo ${i + 1} of ${files.length}...` 
                    : `Publicando foto ${i + 1} de ${files.length}...`;

                try {
                    const compressedBlob = await imageCompression(file, options);
                    const thumbFile = new File([compressedBlob], file.name.replace(/\.[^/.]+$/, "") + ".webp", { type: "image/webp" });

                    const formData = new FormData();
                    formData.append("guestName", guestNameInput);
                    formData.append("original", file);
                    formData.append("thumb", thumbFile);

                    const response = await fetch(`${WORKER_URL}/api/upload`, { method: "POST", body: formData });
                    if (response.ok) uploadedCount++;
                } catch (error) { console.error("Error", error); }
            }

            statusEl.innerText = isEn 
                ? `Success! ${uploadedCount} photo(s) published to the feed.` 
                : `¡Éxito! Se publicaron ${uploadedCount} fotos en el feed.`;
            statusEl.style.color = "green";
            fileInput.value = ""; 
            btn.disabled = false;
            
            setTimeout(() => {
                statusEl.style.display = "none";
                statusEl.style.color = "#555";
                loadCGGallery(); // Recarga Chicosgram
                
            }, 2000);
        }

        async function loadCGGallery() {
            const container = document.getElementById("cgGalleryGrid");
            try {
                const response = await fetch(`${WORKER_URL}/api/fotos`);
                const allKeys = await response.json();
                
                const mapByPrefix = {};
                allKeys.forEach(key => {
                    const match = key.match(/^(\d+)-(.*?)-(thumb|original)\.\w+$/);
                    if (match) {
                        const prefix = `${match[1]}-${match[2]}`;
                        if (!mapByPrefix[prefix]) mapByPrefix[prefix] = { rawName: match[2], thumb: null, original: null };
                        mapByPrefix[prefix][match[3]] = key;
                    } else if (key.includes('-thumb.')) {
                        const prefix = key.split('-thumb.')[0];
                        const rawName = prefix.split('-').slice(1).join('-');
                        if (!mapByPrefix[prefix]) mapByPrefix[prefix] = { rawName: rawName, thumb: key, original: key };
                    }
                });

                let galleryData = Object.values(mapByPrefix).filter(item => item.thumb);
                galleryData.sort((a, b) => parseInt(b.thumb.split('-')[0]) - parseInt(a.thumb.split('-')[0]));

                container.innerHTML = "";
                
                galleryData.forEach(item => {
                    const cleanName = item.rawName.replace(/_/g, " ").split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
                    
                    const itemEl = document.createElement("div");
                    itemEl.className = "gallery-item";

                    // Estilos para forzar el grid cuadrado de IG
                    itemEl.style.aspectRatio = "1 / 1";
                    itemEl.style.overflow = "hidden";
                    itemEl.style.margin = "0";
                    itemEl.style.borderRadius = "0";

                    // FANCYBOX WRAPPER (EL <a> TAG)
                    const aEl = document.createElement("a");
                    aEl.setAttribute("data-fancybox", "chicosgram-gallery");
                    const thumbUrl = `${WORKER_URL}/api/fotos/${encodeURIComponent(item.thumb)}`;
                    const originalUrl = `${WORKER_URL}/api/fotos/${encodeURIComponent(item.original || item.thumb)}`;
                    
                    // CLAVE PARA VELOCIDAD: Fancybox muestra la version webp 1080p
                    aEl.href = thumbUrl; 
                    // Guardamos el enlace del archivo gigante original en secreto para el boton de descarga
                    aEl.setAttribute("data-original", originalUrl); 
                    aEl.setAttribute("data-caption", cleanName && cleanName.toLowerCase() !== "anonimo" ? `📸 Subida por: ${cleanName}` : "");
                    aEl.style.display = "block";
                    aEl.style.width = "100%";
                    aEl.style.height = "100%";
                    
                    // --- SKELETON LOADER UI ---
                    // Generamos un fondo gris que pulsa suavemente mediante animacion CSS nativa
                    itemEl.classList.add("skeleton-loader-bg");
                    
                    const imgEl = document.createElement("img");
                    imgEl.src = thumbUrl;
                    imgEl.style.width = "100%";
                    imgEl.style.height = "100%";
                    imgEl.style.objectFit = "cover"; 
                    imgEl.style.display = "block";
                    imgEl.style.borderRadius = "0";
                    imgEl.style.opacity = "0"; // Escondida hasta que cargue
                    imgEl.style.transition = "opacity 0.4s ease-in";
                    
                    imgEl.onload = function() {
                        aEl.setAttribute("data-width", this.naturalWidth);
                        aEl.setAttribute("data-height", this.naturalHeight);
                        // Cuando la foto esta lista, apagamos el skeleton y mostramos la foto suavemente
                        itemEl.classList.remove("skeleton-loader-bg");
                        this.style.opacity = "1";
                    };
                    
                    aEl.appendChild(imgEl);
                    itemEl.appendChild(aEl);
                    
                    // Removido: No mostrar el caption debajo de la imagen miniatura en el grid

                    container.appendChild(itemEl);
                });
                
                // Inicializar Fancybox para esta galeria
                if (typeof Fancybox !== "undefined") {
                    Fancybox.bind('[data-fancybox="chicosgram-gallery"]', {
                        Toolbar: {
                            display: {
                                left: ["infobar"],
                                middle: [],
                                right: ["slideshow", "downloadAction", "close"],
                            },
                            items: {
                                downloadAction: {
                                    tpl: `<button class="f-button" title="Descargar"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg></button>`,
                                    click: async () => {
                                        const fancybox = Fancybox.getInstance();
                                        if (!fancybox) return;
                                        const slide = fancybox.getSlide();
                                        if (!slide) return;
                                        
                                        // Leemos el URL original secreto que guardamos en el tag <a>
                                        const originalUrl = slide.triggerEl ? slide.triggerEl.getAttribute("data-original") : slide.src;
                                        try {
                                            const response = await fetch(originalUrl);
                                            const blob = await response.blob();
                                            const blobUrl = window.URL.createObjectURL(blob);
                                            const tempLink = document.createElement("a");
                                            tempLink.href = blobUrl;
                                            tempLink.download = originalUrl.split('/').pop() || "foto-boda.jpg";
                                            document.body.appendChild(tempLink);
                                            tempLink.click();
                                            document.body.removeChild(tempLink);
                                            window.URL.revokeObjectURL(blobUrl);
                                        } catch (e) {
                                            window.open(originalUrl, '_blank');
                                        }
                                    }
                                }
                            }
                        },
                        Carousel: { preload: 3, Panzoom: { touch: false } },
                        Images: { zoom: false }, // APAGADO el motor de zoom animado
                        showClass: "f-fadeIn", // Animacion de entrada suave
                        hideClass: "f-fadeOut", // Animacion de salida suave
                        Hash: false
                    });
                }

            } catch (error) {
                console.error("Error fetching Chicosgram", error);
            }
        }

        document.addEventListener("DOMContentLoaded", () => {
            loadCGGallery();



            // Popstate global para atrapar el boton BACK y cerrar Fancybox si esta abierto
            window.addEventListener('popstate', function (event) {
                if (typeof Fancybox !== 'undefined') {
                    const fbInstance = Fancybox.getInstance();
                    if (fbInstance) {
                        fbInstance.close();
                    }
                }
            });
            

            
            // Detect non-dynamic swipe to change image (since touch drag is disabled)
            let touchStartX = 0;
            let touchEndX = 0;
            
            document.addEventListener('touchstart', e => {
                if (typeof Fancybox !== 'undefined' && Fancybox.getInstance()) {
                    touchStartX = e.changedTouches[0].screenX;
                }
            }, {passive: true});
            
            document.addEventListener('touchend', e => {
                if (typeof Fancybox !== 'undefined' && Fancybox.getInstance()) {
                    touchEndX = e.changedTouches[0].screenX;
                    handleSwipe();
                }
            }, {passive: true});
            
            function handleSwipe() {
                const threshold = 50; // minimum distance to register swipe
                const fb = Fancybox.getInstance();
                if (!fb) return;
                
                if (touchEndX < touchStartX - threshold) {
                    fb.next(); // swipe left -> next
                }
                if (touchEndX > touchStartX + threshold) {
                    fb.prev(); // swipe right -> prev
                }
            }
        });

// CONTROL DE VOLTEO 3D PARA TARJETAS DE HOSPEDAJE RECOMENDADO
window.toggleHotelFlip = function(card) {
    if (!card) return;
    card.classList.toggle('flipped');
};

// ACORDEÓN Y COPIADO DE DATOS BANCARIOS (MESA DE REGALOS)
window.toggleBankDetails = function() {
    const container = document.getElementById("bankDetailsContainer");
    const btn = document.getElementById("btnToggleBank");
    const chevron = document.getElementById("bankChevron");
    if (!container || !btn) return;
    const isExpanded = btn.getAttribute("aria-expanded") === "true";
    if (isExpanded) {
        container.style.maxHeight = "0";
        container.style.opacity = "0";
        btn.setAttribute("aria-expanded", "false");
        btn.querySelector("span").innerText = "Ver datos bancarios";
        if (chevron) chevron.style.transform = "rotate(0deg)";
    } else {
        container.style.maxHeight = (container.scrollHeight + 40) + "px";
        container.style.opacity = "1";
        btn.setAttribute("aria-expanded", "true");
        btn.querySelector("span").innerText = "Ocultar datos bancarios";
        if (chevron) chevron.style.transform = "rotate(180deg)";
    }
};

window.copyBankValue = function(val, btn) {
    if (!val || !btn) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(val).then(() => showCopiedFeedback(btn)).catch(() => fallbackCopy(val, btn));
    } else {
        fallbackCopy(val, btn);
    }
};

function fallbackCopy(val, btn) {
    try {
        const temp = document.createElement("input");
        temp.value = val;
        temp.style.position = "fixed";
        temp.style.opacity = "0";
        document.body.appendChild(temp);
        temp.select();
        document.execCommand("copy");
        document.body.removeChild(temp);
        showCopiedFeedback(btn);
    } catch (e) {
        console.error("No se pudo copiar el texto", e);
    }
}

function showCopiedFeedback(btn) {
    const origHTML = btn.innerHTML;
    btn.innerHTML = `<span style="font-weight: 700;">¡Copiado! ✓</span>`;
    btn.style.background = "#52582f";
    btn.style.color = "#ffffff";
    setTimeout(() => {
        btn.innerHTML = origHTML;
        btn.style.background = "#f2f5eb";
        btn.style.color = "var(--olivo-base)";
    }, 2000);
}

// EASTER EGG: TOCAR 5 VECES EL LOGO FINAL EN LA PORTADA
let footerLogoTapCount = 0;
let footerLogoTapTimer = null;

window.handleFooterLogoTap = function() {
    footerLogoTapCount++;
    clearTimeout(footerLogoTapTimer);
    footerLogoTapTimer = setTimeout(() => {
        footerLogoTapCount = 0;
    }, 2500);

    const logo = document.getElementById("footerWeddingLogo");
    if (logo) {
        logo.style.transform = `scale(${1 + footerLogoTapCount * 0.05})`;
        logo.style.transition = "transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
        setTimeout(() => {
            if (logo) logo.style.transform = "scale(1)";
        }, 150);
    }

    if (footerLogoTapCount >= 5) {
        footerLogoTapCount = 0;
        triggerWeddingMarchEasterEgg();
    }
};

function triggerWeddingMarchEasterEgg() {
    // 1. Confeti dorado de celebración
    if (typeof confetti === "function") {
        const end = Date.now() + 3500;
        const colors = ['#d4af37', '#ffd700', '#f4e4bc', '#52582f', '#ffffff'];
        (function frame() {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0, y: 0.8 },
                colors: colors
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1, y: 0.8 },
                colors: colors
            });
            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    }

    // 2. Chiptune de 8-bits de la Marcha Nupcial (Bridal Chorus / Here Comes the Bride)
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
            const actx = new AudioCtx();
            if (actx.state === 'suspended') actx.resume();

            const notes = [
                { f: 246.94, d: 0.35 }, // B3
                { f: 329.63, d: 0.55 }, // E4
                { f: 329.63, d: 0.25 }, // E4
                { f: 329.63, d: 0.70 }, // E4
                { f: 246.94, d: 0.35 }, // B3
                { f: 369.99, d: 0.55 }, // F#4
                { f: 311.13, d: 0.25 }, // D#4
                { f: 329.63, d: 0.70 }, // E4
                { f: 246.94, d: 0.35 }, // B3
                { f: 329.63, d: 0.35 }, // E4
                { f: 440.00, d: 0.50 }, // A4
                { f: 415.30, d: 0.35 }, // G#4
                { f: 369.99, d: 0.35 }, // F#4
                { f: 329.63, d: 0.35 }, // E4
                { f: 311.13, d: 0.35 }, // D#4
                { f: 329.63, d: 0.80 }  // E4
            ];

            let currTime = actx.currentTime + 0.05;
            notes.forEach(n => {
                const osc = actx.createOscillator();
                const gain = actx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(n.f, currTime);
                gain.gain.setValueAtTime(0.25, currTime);
                gain.gain.exponentialRampToValueAtTime(0.01, currTime + n.d - 0.04);
                osc.connect(gain);
                gain.connect(actx.destination);
                osc.start(currTime);
                osc.stop(currTime + n.d);
                currTime += n.d;
            });
        }
    } catch(e) {
        console.warn("Audio error:", e);
    }

    // 3. Notificación flotante de felicitación
    const toast = document.createElement("div");
    toast.innerText = document.documentElement.lang === "en" 
        ? "💒 Here come the bride & groom! ♡ Mariana & Memo"
        : "💒 ¡Que vivan los novios! ♡ Mariana & Memo";
    toast.style.cssText = "position: fixed; bottom: 35px; left: 50%; transform: translateX(-50%); background: #52582f; color: #fff; padding: 12px 26px; border-radius: 30px; font-weight: 600; font-size: 0.95rem; box-shadow: 0 8px 24px rgba(0,0,0,0.3); z-index: 99999; pointer-events: none; opacity: 1; transition: opacity 0.5s ease;";
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 500);
    }, 4500);
}