
// GLOBAL URL PARAMETER PRESERVER
// Asegura que el parámetro '?p=' (Party ID) viaje a todas las páginas internas.
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const partyId = urlParams.get('p') || localStorage.getItem('bodachicos_party_id');
    
    if (partyId) {
        // Guardamos o actualizamos en cache
        localStorage.setItem('bodachicos_party_id', partyId);
        
        document.querySelectorAll('a').forEach(link => {
            const href = link.getAttribute('href');
            // Solo inyectar en links que apunten a htmls internos o al root
            if (href && (href.includes('.html') || href === '/') && !href.startsWith('http') && !href.startsWith('tel') && !href.startsWith('javascript')) {
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

        menuToggle.addEventListener("click", () => {
            mobileDrawer.classList.toggle("is-active");
            // Cambiar dinámicamente el icono de hamburguesa a un icono 'X'
            const isOpen = mobileDrawer.classList.contains("is-active");
            menuToggle.innerHTML = isOpen 
                ? `<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="white"/></svg>`
                : `<svg viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" fill="white"/></svg>`;
        });

        function closeDrawer() {
            mobileDrawer.classList.remove("is-active");
            menuToggle.innerHTML = `<svg viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" fill="white"/></svg>`;
        }

        // Contador en tiempo real
        const targetDate = new Date("Feb 13, 2027 16:00:00").getTime();
        function updateTimer() {
            const now = new Date().getTime();
            const diff = targetDate - now;
            if (diff > 0) {
                document.getElementById("days").innerText = Math.floor(diff / (1000 * 60 * 60 * 24));
                document.getElementById("hours").innerText = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                document.getElementById("minutes").innerText = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                document.getElementById("seconds").innerText = Math.floor((diff % (1000 * 60)) / 1000);
            }
        }
        setInterval(updateTimer, 1000);
        updateTimer();

        // Función para descargar el archivo .ics para Apple Calendar (iOS)
        function downloadICS() {
            const icsContent = [
                "BEGIN:VCALENDAR",
                "VERSION:2.0",
                "PRODID:-//Boda Mariana y Memo//NONSGML v1.0//MX",
                "CALSCALE:GREGORIAN",
                "BEGIN:VEVENT",
                "DTSTART:20270213T213000Z", // 15:30 CST en formato UTC
                "DTEND:20270214T053000Z",   // 23:30 CST en formato UTC
                "SUMMARY:Boda Mariana & Memo",
                "DESCRIPTION:¡Nos casamos! Te invitamos a celebrar junto a nosotros este día tan especial en Cholula, Puebla. Conoce todos los detalles en nuestra página web: https://bodadeloschicos.pages.dev/",
                "LOCATION:Ceremonia en Parroquia de San Andrés Apóstol / Recepción en Hacienda San José Actipan",
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
            const partyId = urlParams.get("id") || urlParams.get("p") || urlParams.get("invitado");
            if (partyId) {
                fetchRSVPData(partyId);
            }
        });

        function searchRSVPInvitation() {
            const val = document.getElementById("rsvpSearchInput").value.trim().toLowerCase().replace(/\s+/g, "-");
            if (!val) return;
            fetchRSVPData(val);
        }

        async function fetchRSVPData(id) {
            document.getElementById("rsvpSearchContainer").style.display = "none";
            document.getElementById("rsvpFormContainer").style.display = "none";
            document.getElementById("rsvpSuccessContainer").style.display = "none";
            document.getElementById("rsvpLoadingContainer").style.display = "block";
            document.getElementById("rsvpSearchError").style.display = "none";

            try {
                const res = await fetch(`${APPS_SCRIPT_URL}?id=${encodeURIComponent(id)}`);
                const data = await res.json();

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
                    const errEl = document.getElementById("rsvpSearchError");
                    errEl.innerText = `No encontramos una invitación con la clave '${id}'. Por favor verifica e intenta de nuevo.`;
                    errEl.style.display = "block";
                }
                
                // EL FIX: Re-centrar silenciosamente la página al ancla si el DOM cambió
                if (window.location.hash) {
                    setTimeout(() => {
                        const target = document.querySelector(window.location.hash);
                        if (target) target.scrollIntoView({ behavior: 'auto' });
                    }, 20); 
                }
            } catch (err) {
                console.error("Error al obtener RSVP:", err);
                document.getElementById("rsvpLoadingContainer").style.display = "none";
                document.getElementById("rsvpSearchContainer").style.display = "block";
                const errEl = document.getElementById("rsvpSearchError");
                errEl.innerText = "Ocurrió un error al conectar con la lista de invitados. Intenta de nuevo.";
                errEl.style.display = "block";
            }
        }

        function renderRSVPSummaryView(data) {
            document.getElementById("rsvpLoadingContainer").style.display = "none";
            document.getElementById("rsvpFormContainer").style.display = "none";
            
            const successContainer = document.getElementById("rsvpSuccessContainer");
            successContainer.style.display = "block";

            const isCivil = (data.invitaCivil && data.invitaCivil.toString().trim().toUpperCase() === "SI");
            const integrantes = data.integrantes ? data.integrantes.toString().split(",").map(s => s.trim()) : [data.nombre];

            // Dinamizar el placeholder del input de celebración especial
            const celebracionInput = document.getElementById("rsvpCelebracionInput");
            if (celebracionInput && integrantes.length > 0) {
                const primerNombre = integrantes[0].split(" ")[0]; // Extraemos solo el primer nombre
                celebracionInput.placeholder = `Ej. Aniversario de ${primerNombre}, cumpleaños...`;
            }

            // CONTROL DEL ITINERARIO: Mostrar el Viernes 12 de Febrero en el Itinerario SOLO a invitados a la boda civil
            const itinFriday = document.getElementById("itineraryFridayBlock");
            if (itinFriday) {
                itinFriday.style.display = isCivil ? "block" : "none";
            }

            let summaryHTML = `
                <span style="font-size: 3.2rem; display: inline-block;">🎉</span>
                <h3 style="color: var(--olivo-base); font-size: 1.5rem; font-weight: 600; margin: 10px 0 4px 0;">¡Respuesta Registrada!</h3>
                <p style="color: #666; font-size: 0.9rem; margin-bottom: 20px;">Hola <strong>${data.nombre}</strong>, ya recibimos tu confirmación oficial.</p>

                <div style="text-align: left; background: #f9faf7; padding: 18px; border-radius: 18px; border: 1px solid rgba(82, 88, 47, 0.15); margin-bottom: 20px; font-size: 0.9rem; color: #444; line-height: 1.6;">
            `;

            if (isCivil) {
                summaryHTML += `
                    <div style="margin-bottom: 14px;">
                        <h4 style="color: var(--olivo-base); font-size: 0.95rem; margin: 0 0 4px 0; font-weight: 600;">🥂 Boda Civil (Viernes 12 de Feb):</h4>
                        <p style="margin: 0; padding-left: 10px; border-left: 3px solid var(--olivo-base); color: #333; font-weight: 500;">${(data.estadoCivil || 'Sin respuesta').split(' | ').join('<br>')}</p>
                    </div>
                `;
            }

            summaryHTML += `
                <div style="margin-bottom: 14px;">
                    <h4 style="color: var(--olivo-base); font-size: 0.95rem; margin: 0 0 4px 0; font-weight: 600;">💒 Boda & Fiesta (Sábado 13 de Feb):</h4>
                    <p style="margin: 0; padding-left: 10px; border-left: 3px solid var(--olivo-base); color: #333; font-weight: 500;">${(data.estadoSabado || 'Sin respuesta').split(' | ').join('<br>')}</p>
                </div>
            `;

            if (data.alergias && data.alergias.trim() !== "" && data.alergias.trim().toLowerCase() !== "ninguna") {
                summaryHTML += `
                    <div style="margin-bottom: 14px;">
                        <h4 style="color: var(--olivo-base); font-size: 0.95rem; margin: 0 0 4px 0; font-weight: 600;">🥗 Restricciones alimenticias:</h4>
                        <p style="margin: 0; color: #555;">${data.alergias}</p>
                    </div>
                `;
            }

            if (data.celebracion && data.celebracion.trim() !== "") {
                summaryHTML += `
                    <div>
                        <h4 style="color: var(--olivo-base); font-size: 0.95rem; margin: 0 0 4px 0; font-weight: 600;">🎉 Celebración especial:</h4>
                        <p style="margin: 0; color: #555;">${data.celebracion}</p>
                    </div>
                `;
            }

            summaryHTML += `</div>`;

            summaryHTML += `
                <button onclick="renderRSVPForm(currentRSVPData)" class="btn btn-rsvp" style="padding: 12px 24px; font-size: 0.9rem; border-radius: 14px; margin-top: 5px; width: 100%; box-sizing: border-box;">Modificar o actualizar respuesta ✏️</button>
            `;

            successContainer.innerHTML = summaryHTML;
        }

        function updateRSVPSubmitButtonText() {
            const submitBtn = document.getElementById("rsvpSubmitBtn");
            if (!submitBtn) return;
            const checkedRadios = document.querySelectorAll('#rsvpCustomForm input[type="radio"]:checked');
            let hasAnyYes = false;
            checkedRadios.forEach(r => {
                if (r.value === "SI") hasAnyYes = true;
            });
            if (hasAnyYes) {
                submitBtn.innerText = "Confirmar Asistencia 💌";
            } else {
                submitBtn.innerText = "Enviar Respuesta 💌";
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
            document.getElementById("rsvpLoadingContainer").style.display = "none";
            document.getElementById("rsvpSuccessContainer").style.display = "none";
            document.getElementById("rsvpSearchContainer").style.display = "none";
            document.getElementById("rsvpFormContainer").style.display = "block";

            document.getElementById("rsvpGuestTitle").innerText = `¡Hola ${data.nombre}!`;
            document.getElementById("rsvpPassesText").innerText = `Tienen ${data.pasesSabado} pase(s) reservado(s) para nuestra boda.`;

            const integrantes = data.integrantes ? data.integrantes.toString().split(",").map(s => s.trim()) : [data.nombre];
            const isCivil = (data.invitaCivil && data.invitaCivil.toString().trim().toUpperCase() === "SI");

            // Dinamizar el placeholder del input de celebración especial
            const celebracionInput = document.getElementById("rsvpCelebracionInput");
            if (celebracionInput && integrantes.length > 0) {
                const primerNombre = integrantes[0].split(" ")[0]; // Extraemos solo el primer nombre
                celebracionInput.placeholder = `Ej. Aniversario de ${primerNombre}, cumpleaños...`;
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
                            <label style="cursor: pointer; display: flex; align-items: center; gap: 6px; background: #f2f5eb; padding: 6px 12px; border-radius: 20px; font-weight: 600; color: #52582f;"><input type="radio" name="civil_${idx}" value="SI" ${siChecked} onchange="updateRSVPSubmitButtonText()"> Sí asistirá</label>
                            <label style="cursor: pointer; display: flex; align-items: center; gap: 6px; background: #fbebee; padding: 6px 12px; border-radius: 20px; font-weight: 600; color: #c0392b;"><input type="radio" name="civil_${idx}" value="NO" ${noChecked} onchange="updateRSVPSubmitButtonText()"> No asistirá</label>
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
                            <label style="cursor: pointer; display: flex; align-items: center; gap: 6px; background: #f2f5eb; padding: 6px 12px; border-radius: 20px; font-weight: 600; color: #52582f;"><input type="radio" name="sabado_${idx}" value="SI" ${siChecked} onchange="updateRSVPSubmitButtonText()"> Sí asistirá</label>
                            <label style="cursor: pointer; display: flex; align-items: center; gap: 6px; background: #fbebee; padding: 6px 12px; border-radius: 20px; font-weight: 600; color: #c0392b;"><input type="radio" name="sabado_${idx}" value="NO" ${noChecked} onchange="updateRSVPSubmitButtonText()"> No asistirá</label>
                        </div>
                    </div>
                    <div>
                        <textarea id="alergia_${idx}" rows="2" placeholder="Restricciones alimenticias de ${member} (ej. vegetariano, alergia a mariscos...)" style="width: 100%; padding: 9px 12px; border: 1px solid #e0e0e0; border-radius: 10px; font-size: 16px; outline: none; box-sizing: border-box; background: #fafafa; font-family: inherit; resize: vertical;"></textarea>
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
                        const mVal = kv.slice(1).join(":");
                        integrantes.forEach((member, idx) => {
                            if (member.toLowerCase() === mName.toLowerCase()) {
                                const input = document.getElementById(`alergia_${idx}`);
                                if (input) input.value = mVal;
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

            const submitBtn = document.getElementById("rsvpSubmitBtn");
            submitBtn.disabled = true;
            submitBtn.innerText = "Guardando confirmación... 💌";

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

                const algVal = document.getElementById(`alergia_${idx}`)?.value.trim() || "";
                if (algVal) {
                    alergiasList.push(`${member}: ${algVal}`);
                }
            });

            const celebracionVal = document.getElementById("rsvpCelebracionInput").value.trim();

            const payload = {
                id: currentRSVPData.id,
                estadoSabado: estadoSabadoList.join(" | "),
                estadoCivil: isCivil ? estadoCivilList.join(" | ") : "N/A",
                alergias: alergiasList.length > 0 ? alergiasList.join(" | ") : "Ninguna",
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
            } catch (err) {
                console.error("Error al enviar RSVP:", err);
                alert("Ocurrió un inconveniente al guardar. Por favor intenta de nuevo.");
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerText = "Confirmar Asistencia 💌";
            }
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
            if (input.files && input.files.length > 0) {
                btn.style.display = "flex";
                labelText.innerText = `${input.files.length} foto(s) seleccionada(s)`;
            } else {
                btn.style.display = "none";
                labelText.innerText = "Elegir fotos...";
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
            setTimeout(() => { err.style.display = "none"; }, 4000);
        }

        async function uploadFotosCG() {
            const guestNameInput = document.getElementById("cgGuestName").value.trim();
            const fileInput = document.getElementById("cgFileInput");
            const statusEl = document.getElementById("cgUploadStatus");
            const btn = document.getElementById("cgUploadBtn");

            if (!guestNameInput) { showCGError("¡Falta tu nombre de Paparazzi!"); return; }
            if (fileInput.files.length === 0) { showCGError("¡Selecciona al menos una foto para publicar!"); return; }

            statusEl.style.display = "block";
            btn.disabled = true;

            const files = Array.from(fileInput.files);
            let uploadedCount = 0;

            const options = { maxSizeMB: 0.3, maxWidthOrHeight: 1080, useWebWorker: true, fileType: "image/webp" };

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                statusEl.innerText = `Publicando foto ${i + 1} de ${files.length}...`;

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

            statusEl.innerText = `¡Éxito! Se publicaron ${uploadedCount} fotos en el feed.`;
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