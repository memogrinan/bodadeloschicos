
// GLOBAL URL PARAMETER PRESERVER & SESSION ISOLATION
// Asegura que el parámetro '?p=' (Party ID) viaje a todas las páginas internas y detecta cambios de invitación
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const pParam = (urlParams.get('p') || urlParams.get('id') || urlParams.get('invitado') || '').trim().toLowerCase();
    const storedParty = (localStorage.getItem('bodachicos_party_id') || '').trim().toLowerCase();
    
    // Si viene un link con una invitación DISTINTA a la guardada en este dispositivo:
    if (pParam && storedParty && pParam !== storedParty) {
        console.log(`[Sesión] Nueva invitación detectada en URL (${pParam} vs previa ${storedParty}). Limpiando sesión previa para evitar cruce de puntos.`);
        localStorage.setItem('bodachicos_party_id', pParam);
        localStorage.removeItem('bodachicos_gamertag');
        localStorage.removeItem('bodachicos_real_name');
        localStorage.removeItem('bodachicos_guest_id');
        ['chico', 'chica', 'maddie', 'puebla'].forEach(g => localStorage.removeItem('bodachicos_score_' + g));
        localStorage.removeItem('bodachicos_admin_bonus');
        localStorage.removeItem('bodachicos_bonus_chicoins');
        localStorage.removeItem('bodachicos_maxdist_puebla');
        localStorage.removeItem('bodachicos_puebla_won');
        localStorage.removeItem('bodachicos_time_played');
    } else if (pParam) {
        localStorage.setItem('bodachicos_party_id', pParam);
    }
    
    const activeParty = pParam || storedParty;
    if (activeParty) {
        document.querySelectorAll('a').forEach(link => {
            const href = link.getAttribute('href');
            if (href && (href.includes('.html') || href === '/' || href.startsWith('/en') || href.startsWith('../')) && !href.startsWith('http') && !href.startsWith('tel') && !href.startsWith('javascript')) {
                try {
                    const urlObj = new URL(link.href, window.location.origin);
                    urlObj.searchParams.set('p', activeParty);
                    link.href = urlObj.toString();
                } catch(e) {}
            }
        });
    }
});

        // CONFIGURACIÓN DE METAS (Score targets)
        const METAS = {
            chico: 350,
            chica: 30,
            maddie: 25,
            puebla: 200
        };

        const isEnLang = document.documentElement.lang === "en";
        const assetPrefix = isEnLang ? "../" : "";

        let playerGamertag = "";
        let activeGame = null;
        let gameInterval = null;
        let score = 0;
        let gameRunning = false;
        let gameStartTime = 0;
        
        // Música de Fondo (Background Music)
        const bgMusic = new window.Audio();
        bgMusic.loop = true; // El atributo loop del navegador conecta el final con el inicio de la cancion
        bgMusic.volume = 0.2; // Un volumen prudente para que no sature los efectos de sonido

        // SPRITES E IMÁGENES DEL JUEGO DINO
        const sprite = new Image();
        sprite.src = assetPrefix + 'SpritesNecesarios/Dino/Optimizadas/sprites.webp';

        // CARGA DE SPRITES PIXEL ART NATIVOS (32x32)
        const imgCalendar = new Image();
        imgCalendar.src = assetPrefix + 'SpritesNecesarios/calendario.png?v=38.0';

        const imgClock = new Image();
        imgClock.src = assetPrefix + 'SpritesNecesarios/Dino/Software_Clock_Time_Wait_Alarm_Sleep_Wake_Up_pixel.png';

        const imgEmail = new Image();
        imgEmail.src = assetPrefix + 'SpritesNecesarios/Dino/Software_Email_Message_Unread_Closed_pixel.png';

        const imgGamepad = new Image();
        imgGamepad.src = assetPrefix + 'SpritesNecesarios/Dino/Controller_Gamepad_pixel.png';

        // SPRITES PARA JUEGO 2: LA CHICA
        const imgChicaCrown = new Image();
        imgChicaCrown.src = assetPrefix + 'SpritesNecesarios/Hats_Crown_Queen_Tiara.png';

        const imgChicaHeart = new Image();
        imgChicaHeart.src = assetPrefix + 'SpritesNecesarios/Boardgames_Card_Suit_Hearts.png';

        const imgChicaRing = new Image();
        imgChicaRing.src = assetPrefix + 'ImagenesWeb/Optimizadas/icono_anillo_compromiso.webp';

        const imgChicaCloud = new Image();
        imgChicaCloud.src = assetPrefix + 'SpritesNecesarios/Weather_Thunderstorm_Cloud_Lightning_Zap.png';

        // SPRITES PARA JUEGO 3: MADDIE
        const imgMaddiePoop = new Image();
        imgMaddiePoop.src = assetPrefix + 'SpritesNecesarios/Emoji_Poop_Shite_Doodoo_Poopoo_Brown_Mousse_Cream_Creme.png';

        // SPRITES PARA JUEGO 4: PUEBLA

        const imgTrafficCar1 = new Image();
        imgTrafficCar1.src = assetPrefix + 'SpritesNecesarios/coches_uno.png';

        const imgTrafficCar3 = new Image();
        imgTrafficCar3.src = assetPrefix + 'SpritesNecesarios/coches_tres.png';

        const imgTrafficCar4 = new Image();
        imgTrafficCar4.src = assetPrefix + 'SpritesNecesarios/coches_cuatro.png';

        const imgTrafficCar2 = new Image();
        imgTrafficCar2.src = assetPrefix + 'SpritesNecesarios/coche_dos.png';

        const imgPueblaHeart = new Image();
        imgPueblaHeart.src = assetPrefix + 'SpritesNecesarios/RPG_Stat_HP_Health_Heart_Small.png';

        const imgPueblaMap = new Image();
        imgPueblaMap.src = assetPrefix + 'SpritesNecesarios/Map_Markers_Travel_Map_Folded.png';

        const imgPueblaPothole = new Image();
        imgPueblaPothole.src = assetPrefix + 'SpritesNecesarios/Map_Markers_Hole_Trap.png';

        const imgPueblaBarrier = new Image();
        imgPueblaBarrier.src = assetPrefix + 'SpritesNecesarios/Map_Markers_Building_Stone_Wall_Fortification.png';

        // PAISAJE DINÁMICO PARA CAMINO A PUEBLA
        const imgSceneryTree = new Image();
        imgSceneryTree.src = assetPrefix + 'SpritesNecesarios/Map_Markers_Tree_Forest_Pine.png';

        const imgSceneryCactus = new Image();
        imgSceneryCactus.src = assetPrefix + 'SpritesNecesarios/Map_Markers_Cactus_Desert.png';

        const imgSceneryLamp = new Image();
        imgSceneryLamp.src = assetPrefix + 'SpritesNecesarios/Map_Markers_Building_Lamp_Post_1.png';

        const imgSceneryChurch = new Image();
        imgSceneryChurch.src = assetPrefix + 'SpritesNecesarios/Map_Markers_Building_Church_Faith_Temple.png';

        // SPRITE EASTER EGG: MADDIE NAVE ESPACIAL
        const imgMaddieUfo = new Image();
        imgMaddieUfo.src = assetPrefix + 'SpritesNecesarios/maddie_nave_espacial.png?v=38.0';

        // SPRITE EASTER EGG: MARCIANO INVASOR
        const imgMarciano = new Image();
        imgMarciano.src = assetPrefix + 'SpritesNecesarios/marciano.png?v=38.0';

        // SPRITE DE MADDIE EN SU JUEGO (WHACK-A-MADDIE)
        const imgMaddieGame = new Image();
        imgMaddieGame.src = assetPrefix + 'SpritesNecesarios/maddie_juego.png?v=38.0';

        // SPRITES DE LA CHICA (MARIANA) EN SU JUEGO
        const imgChicaGame = new Image();
        imgChicaGame.src = assetPrefix + 'SpritesNecesarios/emoji_chica.png?v=38.0';

        const imgChicaLentesGame = new Image();
        imgChicaLentesGame.src = assetPrefix + 'SpritesNecesarios/emoji_chica_lentes.png?v=38.0';

        // AUDIOS DEDICADOS PARA EASTER EGGS Y JUEGOS
        const sfxCarHonk = new window.Audio(assetPrefix + 'Music/sound_effects/car_honk.mp3');
        sfxCarHonk.volume = 0.85;

        const sfxMaddieBark = new window.Audio(assetPrefix + 'Music/sound_effects/ladrido_maddie_single.mp3');
        sfxMaddieBark.volume = 0.85;

        const sfxSpaceEngine = new window.Audio();
        if (sfxSpaceEngine.canPlayType && sfxSpaceEngine.canPlayType('audio/ogg; codecs="vorbis"')) {
            sfxSpaceEngine.src = assetPrefix + 'Music/sound_effects/spaceEngine_003.ogg';
        } else {
            sfxSpaceEngine.src = assetPrefix + 'Music/sound_effects/spaceEngine_003.m4a';
        }
        sfxSpaceEngine.volume = 0.70; // Volumen nítido y claro mientras cruza la nave espacial

        // Comprobaciones de error de carga para los sprites
        const handleImageError = (name, src) => {
            console.error(`ERROR: No se pudo cargar el sprite '${name}' en: ${src}`);
        };
        sprite.onerror = () => handleImageError('SpritesNecesarios/Dino/Optimizadas/sprites.webp', sprite.src);
        imgCalendar.onerror = () => handleImageError('calendario.png', imgCalendar.src);
        imgClock.onerror = () => handleImageError('Clock.png', imgClock.src);
        imgEmail.onerror = () => handleImageError('Email.png', imgEmail.src);
        imgGamepad.onerror = () => handleImageError('Gamepad.png', imgGamepad.src);

        imgChicaCrown.onerror = () => handleImageError('Hats_Crown_Queen_Tiara.png', imgChicaCrown.src);
        imgChicaHeart.onerror = () => handleImageError('Boardgames_Card_Suit_Hearts.png', imgChicaHeart.src);
        imgChicaRing.onerror = () => handleImageError('ImagenesWeb/Optimizadas/icono_anillo_compromiso.webp', imgChicaRing.src);
        imgChicaCloud.onerror = () => handleImageError('Weather_Thunderstorm_Cloud_Lightning_Zap.png', imgChicaCloud.src);
        imgMaddiePoop.onerror = () => handleImageError('Emoji_Poop.png', imgMaddiePoop.src);
        imgTrafficCar1.onerror = () => handleImageError('coches_uno.png', imgTrafficCar1.src);
        imgTrafficCar3.onerror = () => handleImageError('coches_tres.png', imgTrafficCar3.src);
        imgTrafficCar4.onerror = () => handleImageError('coches_cuatro.png', imgTrafficCar4.src);
        imgTrafficCar2.onerror = () => handleImageError('coche_dos.png', imgTrafficCar2.src);
        imgPueblaHeart.onerror = () => handleImageError('RPG_Stat_HP_Health_Heart_Small.png', imgPueblaHeart.src);
        imgPueblaMap.onerror = () => handleImageError('Map_Markers_Travel_Map_Folded.png', imgPueblaMap.src);
        imgPueblaPothole.onerror = () => handleImageError('Map_Markers_Hole_Trap.png', imgPueblaPothole.src);
        imgPueblaBarrier.onerror = () => handleImageError('Map_Markers_Building_Stone_Wall_Fortification.png', imgPueblaBarrier.src);
        imgSceneryTree.onerror = () => handleImageError('Tree.png', imgSceneryTree.src);
        imgSceneryCactus.onerror = () => handleImageError('Cactus.png', imgSceneryCactus.src);
        imgSceneryLamp.onerror = () => handleImageError('Lamp.png', imgSceneryLamp.src);
        imgSceneryChurch.onerror = () => handleImageError('Church.png', imgSceneryChurch.src);

        const precomputedSprites = {};

        function getTightlyCroppedSprite(img, cols, rows, c, r) {
            const cacheKey = img.src + `_${cols}_${rows}_${c}_${r}`;
            if (precomputedSprites[cacheKey] !== undefined) return precomputedSprites[cacheKey];

            const sw = img.naturalWidth / cols;
            const sh = img.naturalHeight / rows;
            const sx = c * sw;
            const sy = r * sh;

            const offCanvas = document.createElement("canvas");
            offCanvas.width = sw;
            offCanvas.height = sh;
            const oCtx = offCanvas.getContext("2d", { willReadFrequently: true });
            oCtx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

            const imgData = oCtx.getImageData(0, 0, sw, sh);
            const data = imgData.data;
            let minX = sw, minY = sh, maxX = 0, maxY = 0;
            let hasPixels = false;

            for (let y = 0; y < sh; y++) {
                for (let x = 0; x < sw; x++) {
                    const alpha = data[(y * sw + x) * 4 + 3];
                    if (alpha > 10) { // not fully transparent
                        if (x < minX) minX = x;
                        if (x > maxX) maxX = x;
                        if (y < minY) minY = y;
                        if (y > maxY) maxY = y;
                        hasPixels = true;
                    }
                }
            }

            if (!hasPixels) {
                precomputedSprites[cacheKey] = null;
                return null;
            }

            // Expand bounds slightly to prevent hard cutoffs
            const pad = 2;
            minX = Math.max(0, minX - pad);
            minY = Math.max(0, minY - pad);
            maxX = Math.min(sw - 1, maxX + pad);
            maxY = Math.min(sh - 1, maxY + pad);

            const cropW = maxX - minX + 1;
            const cropH = maxY - minY + 1;

            const finalCanvas = document.createElement("canvas");
            finalCanvas.width = cropW;
            finalCanvas.height = cropH;
            finalCanvas.getContext("2d").drawImage(offCanvas, minX, minY, cropW, cropH, 0, 0, cropW, cropH);
            
            precomputedSprites[cacheKey] = finalCanvas;
            return finalCanvas;
        }

        let trafficSpriteDefs = null;

        function initTrafficDefs() {
            if (trafficSpriteDefs) return;
            trafficSpriteDefs = [];
            
            // coches_uno (matrix 4x3) - la segunda columna son la parte trasera (index 1)
            for (let r = 0; r < 3; r++) {
                trafficSpriteDefs.push({ img: imgTrafficCar1, cols: 4, rows: 3, c: 1, r: r });
            }
            
            // coche_dos (recortado completo) -> 1x1
            trafficSpriteDefs.push({ img: imgTrafficCar2, cols: 1, rows: 1, c: 0, r: 0 });
            
            // coches_tres (matrix 3x2) - la segunda fila es la parte trasera (index 1)
            for (let c = 0; c < 3; c++) {
                trafficSpriteDefs.push({ img: imgTrafficCar3, cols: 3, rows: 2, c: c, r: 1 });
            }
            
            // coches_cuatro (matrix 4x3) - la segunda columna son la parte trasera (index 1)
            for (let r = 0; r < 3; r++) {
                // Evitamos nuestro coche (col 2, fila 3 -> c: 1, r: 2)
                if (r === 2) continue; 
                trafficSpriteDefs.push({ img: imgTrafficCar4, cols: 4, rows: 3, c: 1, r: r });
            }
        }

        // AUDIO CONTEXT NATIVO DE 8-BITS
        let audioCtx = null;

        function initAudio() {
            try {
                if (!audioCtx) {
                    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                }
                if (audioCtx && audioCtx.state === 'suspended') {
                    audioCtx.resume();
                }
            } catch (e) {
                console.warn("No se pudo iniciar AudioContext:", e);
            }
        }

        // FEEDBACK HÁPTICO PARA INMERSIÓN
        function triggerHaptic(pattern) {
            // Solo se activa si el dispositivo soporta vibración (ej. Androids)
            if (navigator.vibrate) {
                try {
                    navigator.vibrate(pattern);
                } catch(e) {}
            }
        }

        function playSound(type) {            if (!audioCtx) return;
            try {
                const now = audioCtx.currentTime;

                if (type === 'bark') {
                    // Si el audio real de Maddie está disponible, se reproduce con prioridad
                    if (typeof sfxMaddieBark !== 'undefined') {
                        try {
                            sfxMaddieBark.currentTime = 0;
                            sfxMaddieBark.play().catch(() => {});
                            return;
                        } catch (e) {}
                    }
                    // Ladrido sintetizado de respaldo si no hay audio
                    const osc1 = audioCtx.createOscillator();
                    const osc2 = audioCtx.createOscillator();
                    const barkGain = audioCtx.createGain();
                    
                    osc1.type = 'triangle';
                    osc2.type = 'sine';
                    
                    osc1.frequency.setValueAtTime(460, now);
                    osc1.frequency.exponentialRampToValueAtTime(740, now + 0.04);
                    osc1.frequency.exponentialRampToValueAtTime(320, now + 0.12);
                    
                    osc2.frequency.setValueAtTime(230, now);
                    osc2.frequency.exponentialRampToValueAtTime(370, now + 0.04);
                    osc2.frequency.exponentialRampToValueAtTime(160, now + 0.12);

                    barkGain.gain.setValueAtTime(0.18, now);
                    barkGain.gain.exponentialRampToValueAtTime(0.01, now + 0.13);
                    
                    osc1.connect(barkGain);
                    osc2.connect(barkGain);
                    barkGain.connect(audioCtx.destination);
                    
                    osc1.start(now);
                    osc2.start(now);
                    osc1.stop(now + 0.13);
                    osc2.stop(now + 0.13);
                    return;
                } else if (type === 'car_rev') {
                    // Sonido potente y auténtico de acelerón / rev de motor de auto deportivo ("VRROOOM!")
                    const osc1 = audioCtx.createOscillator();
                    const osc2 = audioCtx.createOscillator();
                    const engineGain = audioCtx.createGain();
                    const filter = audioCtx.createBiquadFilter();
                    
                    // Doble oscilador en diente de sierra con desfase para el rugido mecánico de cilindros
                    osc1.type = 'sawtooth';
                    osc2.type = 'sawtooth';
                    osc2.detune.setValueAtTime(24, now);

                    // Barrido de revoluciones del motor (RPM surge)
                    osc1.frequency.setValueAtTime(75, now);
                    osc1.frequency.exponentialRampToValueAtTime(240, now + 0.08);
                    osc1.frequency.exponentialRampToValueAtTime(110, now + 0.22);

                    osc2.frequency.setValueAtTime(76, now);
                    osc2.frequency.exponentialRampToValueAtTime(245, now + 0.08);
                    osc2.frequency.exponentialRampToValueAtTime(112, now + 0.22);

                    // Filtro paso-banda resonante para simular el tubo de escape rugiendo
                    filter.type = 'bandpass';
                    filter.Q.setValueAtTime(2.2, now);
                    filter.frequency.setValueAtTime(320, now);
                    filter.frequency.exponentialRampToValueAtTime(1450, now + 0.08);
                    filter.frequency.exponentialRampToValueAtTime(450, now + 0.22);

                    // Envolvente de volumen (ataque rápido y corte limpio)
                    engineGain.gain.setValueAtTime(0.01, now);
                    engineGain.gain.linearRampToValueAtTime(0.24, now + 0.03);
                    engineGain.gain.linearRampToValueAtTime(0.18, now + 0.12);
                    engineGain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

                    osc1.connect(filter);
                    osc2.connect(filter);
                    filter.connect(engineGain);
                    engineGain.connect(audioCtx.destination);

                    osc1.start(now);
                    osc2.start(now);
                    osc1.stop(now + 0.22);
                    osc2.stop(now + 0.22);
                    return;
                } else if (type === 'wedding_horn') {
                    // Reproducir el sonido de claxon auténtico recortado a 5 pitidos
                    try {
                        sfxCarHonk.currentTime = 0;
                        sfxCarHonk.play().catch(e => console.log('Car honk audio err:', e));
                    } catch (e) {}
                    return;
                }

                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);

                if (type === 'jump') {
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(150, now);
                    osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);
                    gain.gain.setValueAtTime(0.1, now);
                    gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
                    osc.start(now);
                    osc.stop(now + 0.15);
                } else if (type === 'hit') {
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(300, now);
                    osc.frequency.linearRampToValueAtTime(60, now + 0.4);
                    gain.gain.setValueAtTime(0.15, now);
                    gain.gain.linearRampToValueAtTime(0.01, now + 0.4);
                    osc.start(now);
                    osc.stop(now + 0.4);
                } else if (type === 'coin') {
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(523.25, now); // C5
                    osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
                    gain.gain.setValueAtTime(0.1, now);
                    gain.gain.setValueAtTime(0.1, now + 0.08);
                    gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
                    osc.start(now);
                    osc.stop(now + 0.2);
                } else if (type === 'score') {
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(987.77, now); // B5
                    osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
                    gain.gain.setValueAtTime(0.1, now);
                    gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
                    osc.start(now);
                    osc.stop(now + 0.2);
                }
            } catch (e) {
                console.warn("Falla en sintetizador Web Audio API:", e);
            }
        }

        // ELEMENTOS DEL DOM
        const canvas = document.getElementById("gameCanvas");
        const ctx = canvas.getContext("2d");
        const gameOverlay = document.getElementById("gameOverlay");
        const overlayInstructions = document.getElementById("overlayInstructions");
        const startGameBtn = document.getElementById("startGameBtn");
        const maddieGrid = document.getElementById("maddieGrid");
        const overlayScoreBox = document.getElementById("overlayScoreBox");
        const overlayFinalScore = document.getElementById("overlayFinalScore");
        const overlayMetaCompare = document.getElementById("overlayMetaCompare");
        const maddieScoreboard = document.getElementById("maddieScoreboard");
        const currentGameState = document.getElementById("currentGameState");
        const currentGameScore = document.getElementById("currentGameScore");

        // ==========================================
        // CONFIGURACIÓN E INTEGRACIÓN DE FIREBASE REALTIME DB
        // ==========================================
        const firebaseConfig = {
            apiKey: "AIzaSyB66MnDDjpH7XILpVqfh2JLFz0nrPnTcSQ",
            authDomain: "boda-los-chicos.firebaseapp.com",
            databaseURL: "https://boda-los-chicos-default-rtdb.firebaseio.com",
            projectId: "boda-los-chicos",
            storageBucket: "boda-los-chicos.firebasestorage.app",
            messagingSenderId: "898026641890",
            appId: "1:898026641890:web:6467dc77ffeda37d5581bb",
            measurementId: "G-FB0N5FTMJZ"
        };

        if (typeof firebase !== "undefined" && !firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        const db = (typeof firebase !== "undefined") ? firebase.database() : null;

        // FÓRMULA ASINTÓTICA ESTRICTA DE CHI-COINS:
        // - Menor a la meta: proporcional a 1,000 base
        // - Al cumplir la meta: 1,000 ChiCoins
        // - Al duplicar el score (extraRatio = 1): gana solo +300 ChiCoins (1,300 total)
        // - Curva con amortiguamiento fuerte y límite asintótico absoluto de +500 ChiCoins (tope máximo de 1,500 ChiCoins por juego)
        function calculateGameChiCoins(gameKey, scoreVal) {
            const target = METAS[gameKey] || 100;
            if (!scoreVal || scoreVal <= 0) return 0;
            if (scoreVal < target) {
                return Math.floor((scoreVal / target) * 1000);
            }
            const extraRatio = (scoreVal - target) / target;
            const extraCoins = Math.min(500, Math.floor(500 * (extraRatio / (extraRatio + (2 / 3)))));
            return 1000 + extraCoins;
        }

        function areAllMetasPassed() {
            return Object.keys(METAS).every(g => {
                const s = getScore(g);
                if (g === 'puebla') {
                    const pueblaDist = parseFloat(localStorage.getItem("bodachicos_maxdist_puebla") || "0");
                    return localStorage.getItem("bodachicos_puebla_won") === "true" || s >= METAS.puebla || pueblaDist >= 120;
                }
                return s >= METAS[g];
            });
        }

        function getChiCoins(gameKey) {
            const scoreVal = getScore(gameKey);
            return calculateGameChiCoins(gameKey, scoreVal);
        }

        let activePlayerRemoteData = null;
        let activePlayerListenerKey = "";
        let activePlayerListenerHandler = null;
        const isSandboxGuestMode = (new URLSearchParams(window.location.search).get("sandbox") === "1");
        const PLAYERS_DB_PATH = "players";
        const SANDBOX_PLAYERS_STORAGE_KEY = "bodachicos_sandbox_players_v1";

        function getSandboxLocalPlayers() {
            try {
                const raw = localStorage.getItem(SANDBOX_PLAYERS_STORAGE_KEY);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (parsed && typeof parsed === "object") return parsed;
                }
            } catch (e) {}
            return null;
        }

        function updateSandboxLocalPlayer(keyTag, payload) {
            try {
                const current = getSandboxLocalPlayers() || {};
                current[keyTag] = Object.assign({}, current[keyTag] || {}, payload);
                localStorage.setItem(SANDBOX_PLAYERS_STORAGE_KEY, JSON.stringify(current));
            } catch (e) {}
        }

        function getArcadeChiCoinsTotal() {
            let sum = 0;
            Object.keys(METAS).forEach(g => {
                sum += getChiCoins(g);
            });
            const allMetasBonus = areAllMetasPassed() ? 500 : 0;
            return sum + allMetasBonus;
        }

        function getRemoteActivityCoins() {
            if (!activePlayerRemoteData) return 0;
            if (activePlayerRemoteData.activityLogs && typeof activePlayerRemoteData.activityLogs === "object") {
                return Object.values(activePlayerRemoteData.activityLogs).reduce((acc, item) => {
                    return acc + (item && typeof item.amount === "number" ? item.amount : (parseInt(item?.amount) || 0));
                }, 0);
            }
            if (typeof activePlayerRemoteData.activityCoins === "number") {
                return activePlayerRemoteData.activityCoins;
            }
            const legacyBonus = parseInt(activePlayerRemoteData.adminBonus ?? activePlayerRemoteData.bonusCoins ?? 0);
            return isNaN(legacyBonus) ? 0 : legacyBonus;
        }

        function getRemoteSpentCoins() {
            if (!activePlayerRemoteData) return 0;
            if (activePlayerRemoteData.redemptionLogs && typeof activePlayerRemoteData.redemptionLogs === "object") {
                return Object.values(activePlayerRemoteData.redemptionLogs).reduce((acc, item) => {
                    return acc + (item && typeof item.cost === "number" ? item.cost : (parseInt(item?.cost) || 0));
                }, 0);
            }
            if (typeof activePlayerRemoteData.spentCoins === "number") {
                return activePlayerRemoteData.spentCoins;
            }
            return 0;
        }

        function getTotalChiCoins() {
            const arcadeTotal = getArcadeChiCoinsTotal();
            const activityTotal = getRemoteActivityCoins();
            const spentTotal = getRemoteSpentCoins();
            return Math.max(0, arcadeTotal + activityTotal - spentTotal);
        }

        function refreshActivePlayerUI(val) {
            if (!val) return;
            activePlayerRemoteData = val;
            const totalDisplay = document.getElementById("totalChiCoinsDisplay");
            if (totalDisplay) {
                totalDisplay.innerText = getTotalChiCoins().toLocaleString();
            }
            const detailModal = document.getElementById("chiCoinsDetailModal");
            if (detailModal && !detailModal.classList.contains("hidden")) {
                renderChiCoinsDetailModal();
            }
        }

        function attachActivePlayerListener(keyTag) {
            if (!db || !keyTag) return;
            if (activePlayerListenerKey === keyTag && activePlayerListenerHandler) return;

            if (activePlayerListenerKey && activePlayerListenerHandler && !isSandboxGuestMode) {
                try {
                    db.ref(PLAYERS_DB_PATH + "/" + activePlayerListenerKey).off("value", activePlayerListenerHandler);
                } catch (e) {}
            }

            activePlayerListenerKey = keyTag;

            if (isSandboxGuestMode) {
                const applySandboxPlayer = () => {
                    const sbMap = getSandboxLocalPlayers();
                    if (sbMap && sbMap[keyTag]) {
                        refreshActivePlayerUI(sbMap[keyTag]);
                    }
                };
                applySandboxPlayer();
                activePlayerListenerHandler = (e) => {
                    if (!e || e.key === SANDBOX_PLAYERS_STORAGE_KEY) {
                        applySandboxPlayer();
                    }
                };
                window.addEventListener("storage", activePlayerListenerHandler);
                return;
            }

            activePlayerListenerHandler = (snapshot) => {
                const val = snapshot.val();
                if (val) {
                    refreshActivePlayerUI(val);
                }
            };
            db.ref(PLAYERS_DB_PATH + "/" + keyTag).on("value", activePlayerListenerHandler);
        }

        function openChiCoinsDetailModal() {
            const modal = document.getElementById("chiCoinsDetailModal");
            if (!modal) return;
            renderChiCoinsDetailModal();
            modal.classList.remove("hidden");
        }

        function closeChiCoinsDetailModal() {
            const modal = document.getElementById("chiCoinsDetailModal");
            if (!modal) return;
            modal.classList.add("hidden");
        }

        function renderChiCoinsDetailModal() {
            const arcadeCoins = getArcadeChiCoinsTotal();
            const activityCoins = getRemoteActivityCoins();
            const spentCoins = getRemoteSpentCoins();
            const netCoins = Math.max(0, arcadeCoins + activityCoins - spentCoins);

            const elArcade = document.getElementById("detailRowArcadeCoins");
            const elActivity = document.getElementById("detailRowActivityCoins");
            const elSpent = document.getElementById("detailRowSpentCoins");
            const elTotal = document.getElementById("detailRowTotalCoins");

            if (elArcade) elArcade.innerText = `+${arcadeCoins.toLocaleString()}`;
            if (elActivity) elActivity.innerText = `+${activityCoins.toLocaleString()}`;
            if (elSpent) elSpent.innerText = `-${spentCoins.toLocaleString()}`;
            if (elTotal) elTotal.innerText = `${netCoins.toLocaleString()} 🪙`;

            const logContainer = document.getElementById("guestChiCoinsLogList");
            if (!logContainer) return;

            const gameMetaInfo = [
                { key: "chico", icon: "🦖", nameEs: "Chicosaurio", nameEn: "Chicosaurus", unit: "pts" },
                { key: "chica", icon: "👰🏻‍♀️", nameEs: "Atrapa el Amor", nameEn: "Love in the Air", unit: "pts" },
                { key: "maddie", icon: "🐶", nameEs: "Atrapa a Maddie", nameEn: "Whack-a-Maddie!", unit: "clics" },
                { key: "puebla", icon: "🚗", nameEs: "Camino a Puebla", nameEn: "Road to Puebla", unit: "pts" }
            ];

            // 1. SECCIÓN ARCADE (UNIFICADA Y LIMPIA)
            let arcadeRowsHtml = "";
            gameMetaInfo.forEach(g => {
                const s = getScore(g.key);
                const c = calculateGameChiCoins(g.key, s);
                const label = isEnLang ? g.nameEn : g.nameEs;
                arcadeRowsHtml += `
                    <div class="flex justify-between items-center py-1.5">
                        <div class="truncate pr-2">
                            <span class="font-semibold text-gray-700">${g.icon} ${label}</span>
                            <span class="text-[11px] text-gray-400 ml-1">(${s} ${g.unit})</span>
                        </div>
                        <span class="font-monogram font-bold text-sm shrink-0 ${c > 0 ? 'text-gray-800' : 'text-gray-400'}">+${c.toLocaleString()}</span>
                    </div>
                `;
            });

            const allMetas = areAllMetasPassed();
            arcadeRowsHtml += `
                <div class="flex justify-between items-center py-1.5 ${allMetas ? 'text-[#52582f]' : 'text-gray-400'}">
                    <span class="font-bold">🏆 ${isEnLang ? "4 Targets Bonus" : "Bono 4 Metas"}</span>
                    <span class="font-monogram font-bold text-sm shrink-0">${allMetas ? '+500' : '+0'}</span>
                </div>
            `;

            let html = `
                <div class="bg-white border border-gray-200/80 rounded-2xl px-4 py-3 shadow-2xs">
                    <div class="flex justify-between items-center">
                        <span class="font-extrabold text-gray-800 flex items-center gap-1.5"><span>🎮</span> ${isEnLang ? "Arcade" : "Arcade"}</span>
                        <span class="font-monogram text-base font-extrabold text-[#52582f]">+${arcadeCoins.toLocaleString()}</span>
                    </div>
                    <div class="mt-2 pt-2 border-t border-gray-100 divide-y divide-gray-100">
                        ${arcadeRowsHtml}
                    </div>
                </div>
            `;

            // 2. SECCIÓN ACTIVIDADES (PLINKO, YAHTZEE Y EXTRAS)
            const actLogsObj = (activePlayerRemoteData && activePlayerRemoteData.activityLogs && typeof activePlayerRemoteData.activityLogs === "object")
                ? activePlayerRemoteData.activityLogs
                : null;
            const actList = actLogsObj
                ? Object.values(actLogsObj).filter(x => x && typeof x === "object").sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
                : [];

            let actRowsHtml = "";
            if (actList.length > 0) {
                actList.forEach(entry => {
                    const icon = entry.type === "plinko" ? "🎯" : (entry.type === "yahtzee" ? "🎲" : "⭐");
                    const amt = parseInt(entry.amount) || 0;
                    actRowsHtml += `
                        <div class="flex justify-between items-center py-1.5">
                            <span class="font-semibold text-gray-700 truncate pr-2">${icon} ${entry.label || (isEnLang ? "Activity" : "Actividad")}</span>
                            <span class="font-monogram font-bold text-sm text-[#52582f] shrink-0">+${amt.toLocaleString()}</span>
                        </div>
                    `;
                });
            } else if (activityCoins > 0) {
                actRowsHtml += `
                    <div class="flex justify-between items-center py-1.5">
                        <span class="font-semibold text-gray-700">⭐ ${isEnLang ? "Activity Bonus" : "Puntos de Actividades"}</span>
                        <span class="font-monogram font-bold text-sm text-[#52582f] shrink-0">+${activityCoins.toLocaleString()}</span>
                    </div>
                `;
            }

            html += `
                <div class="bg-white border border-gray-200/80 rounded-2xl px-4 py-3 shadow-2xs">
                    <div class="flex justify-between items-center">
                        <div>
                            <span class="font-extrabold text-gray-800 flex items-center gap-1.5"><span>🎯</span> ${isEnLang ? "Activities" : "Actividades"}</span>
                        </div>
                        <span class="font-monogram text-base font-extrabold ${activityCoins > 0 ? 'text-[#52582f]' : 'text-gray-400'}">+${activityCoins.toLocaleString()}</span>
                    </div>
                    ${actRowsHtml ? `<div class="mt-2 pt-2 border-t border-gray-100 divide-y divide-gray-100">${actRowsHtml}</div>` : ""}
                </div>
            `;

            // 3. SECCIÓN PUNTOS UTILIZADOS
            const redLogsObj = (activePlayerRemoteData && activePlayerRemoteData.redemptionLogs && typeof activePlayerRemoteData.redemptionLogs === "object")
                ? activePlayerRemoteData.redemptionLogs
                : null;
            const redList = redLogsObj
                ? Object.values(redLogsObj).filter(x => x && typeof x === "object").sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
                : [];

            let redRowsHtml = "";
            if (redList.length > 0) {
                redList.forEach(entry => {
                    const emoji = entry.emoji || "🎁";
                    const name = entry.itemName || (isEnLang ? "Reward" : "Canje");
                    const cost = parseInt(entry.cost) || 0;
                    redRowsHtml += `
                        <div class="flex justify-between items-center py-1.5">
                            <span class="font-semibold text-gray-700 truncate pr-2">${emoji} ${name}</span>
                            <span class="font-monogram font-bold text-sm text-rose-700 shrink-0">-${cost.toLocaleString()}</span>
                        </div>
                    `;
                });
            } else if (spentCoins > 0) {
                redRowsHtml += `
                    <div class="flex justify-between items-center py-1.5">
                        <span class="font-semibold text-gray-700">✨ ${isEnLang ? "Points Used" : "Puntos Utilizados"}</span>
                        <span class="font-monogram font-bold text-sm text-rose-700 shrink-0">-${spentCoins.toLocaleString()}</span>
                    </div>
                `;
            }

            html += `
                <div class="bg-white border border-gray-200/80 rounded-2xl px-4 py-3 shadow-2xs">
                    <div class="flex justify-between items-center">
                        <span class="font-extrabold text-gray-800 flex items-center gap-1.5"><span>✨</span> ${isEnLang ? "Points Used" : "Puntos Utilizados"}</span>
                        <span class="font-monogram text-base font-extrabold ${spentCoins > 0 ? 'text-rose-700' : 'text-gray-400'}">-${spentCoins.toLocaleString()}</span>
                    </div>
                    ${redRowsHtml ? `<div class="mt-2 pt-2 border-t border-gray-100 divide-y divide-gray-100">${redRowsHtml}</div>` : ""}
                </div>
            `;

            logContainer.innerHTML = html;
        }

        const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwzF6-fMJJeXgOj3djFSm_vo1ZEteYRIj0PFXXhq_4q7eLcoCVmuTNRcKto2GSR-G8XSQ/exec";
        let currentPartyId = "";
        let selectedRealName = "";
        let selectedGuestId = "";
        let playerGuestId = "";
        let partyMembersData = [];
        let playerRealName = "";

        // Formatea el ID de invitado asegurando el prefijo GID_ exclusivamente para IDs numéricos del padrón (ej. 001 -> GID_001, GID_115 -> GID_115)
        function formatGuestId(rawId) {
            if (!rawId) return "";
            let s = String(rawId).trim();
            if (!s) return "";
            const stripped = s.startsWith("GID_") ? s.slice(4).trim() : s;
            if (!/^\d+$/.test(stripped)) return "";
            return "GID_" + stripped;
        }

        // DETECCIÓN INMEDIATA DE CAMBIO DE INVITACIÓN EN URL
        const urlParams = new URLSearchParams(window.location.search);
        const pParam = (urlParams.get("p") || urlParams.get("id") || urlParams.get("invitado") || "").trim().toLowerCase();
        const storedPartyId = (localStorage.getItem("bodachicos_party_id") || "").trim().toLowerCase();

        if (pParam && storedPartyId && pParam !== storedPartyId) {
            console.log(`[Sesión] Cambio de pase detectado (${pParam} vs previo ${storedPartyId}). Reseteando sesión.`);
            localStorage.setItem("bodachicos_party_id", pParam);
            currentPartyId = pParam;
            localStorage.removeItem("bodachicos_gamertag");
            localStorage.removeItem("bodachicos_real_name");
            localStorage.removeItem("bodachicos_guest_id");
            ['chico', 'chica', 'maddie', 'puebla'].forEach(g => localStorage.removeItem('bodachicos_score_' + g));
            localStorage.removeItem('bodachicos_admin_bonus');
            localStorage.removeItem('bodachicos_bonus_chicoins');
            localStorage.removeItem('bodachicos_maxdist_puebla');
            localStorage.removeItem('bodachicos_puebla_won');
            localStorage.removeItem('bodachicos_time_played');
            playerGamertag = "";
            playerRealName = "";
            playerGuestId = "";
            activePlayerRemoteData = null;
        } else if (pParam) {
            currentPartyId = pParam;
            localStorage.setItem("bodachicos_party_id", currentPartyId);
        } else {
            currentPartyId = storedPartyId || "chicos";
        }

        let currentLeaderboardTab = "general";
        let rawPlayersData = {};
        let isLeaderboardListening = false;

        function syncPlayerToFirebase() {
            if (!db || !playerGamertag || !playerGamertag.trim()) return;
            let cleanGuestId = formatGuestId(playerGuestId || localStorage.getItem("bodachicos_guest_id") || (activePlayerRemoteData && activePlayerRemoteData.guestId));
            if (!cleanGuestId && rawPlayersData && typeof rawPlayersData === "object") {
                const lowerTag = playerGamertag.trim().toLowerCase();
                Object.entries(rawPlayersData).forEach(([k, v]) => {
                    if (cleanGuestId || !v || typeof v !== "object" || k.startsWith("__")) return;
                    const gIdCandidate = formatGuestId(v.guestId || k);
                    if (gIdCandidate && (v.gamerTag || "").trim().toLowerCase() === lowerTag) {
                        cleanGuestId = gIdCandidate;
                        if (v.realName && !playerRealName) {
                            playerRealName = v.realName;
                            localStorage.setItem("bodachicos_real_name", playerRealName);
                        }
                    }
                });
            }
            if (cleanGuestId) {
                playerGuestId = cleanGuestId;
                localStorage.setItem("bodachicos_guest_id", cleanGuestId);
            } else {
                localStorage.removeItem("bodachicos_guest_id");
            }

            const cleanGamertag = playerGamertag.trim().replace(/[.#$/[\]]/g, "_");
            const keyTag = cleanGuestId || cleanGamertag;
            if (!keyTag) return;

            attachActivePlayerListener(keyTag);
            
            const remoteScores = (activePlayerRemoteData && activePlayerRemoteData.scores) ? activePlayerRemoteData.scores : {};
            const scoresObj = {};
            const coinsObj = {};
            let arcadeCoinsSum = 0;
            let totalScoreSum = 0;
            
            Object.keys(METAS).forEach(g => {
                const localS = getScore(g);
                const remoteS = parseInt(remoteScores[g]) || 0;
                const s = Math.max(localS, remoteS);
                if (s > localS) {
                    localStorage.setItem("bodachicos_score_" + g, s);
                }
                const c = calculateGameChiCoins(g, s);
                scoresObj[g] = s;
                coinsObj[g] = c;
                arcadeCoinsSum += c;
                totalScoreSum += s;
            });

            // Bono fijo único de +500 si se superaron las 4 metas
            const allMetasBonus = (areAllMetasPassed() || Boolean(activePlayerRemoteData && activePlayerRemoteData.hasAllMetasBonus)) ? 500 : 0;
            arcadeCoinsSum += allMetasBonus;

            // Balance neto respetando estrictamente actividades y canjes del servidor (el cliente NUNCA escribe ni sobreescribe activityLogs ni redemptionLogs)
            const netTotalCoins = Math.max(0, arcadeCoinsSum + getRemoteActivityCoins() - getRemoteSpentCoins());

            let localTimePlayed = parseInt(localStorage.getItem("bodachicos_time_played") || "0");
            if (isNaN(localTimePlayed)) localTimePlayed = 0;
            const remoteTimePlayed = parseInt(activePlayerRemoteData && activePlayerRemoteData.timePlayedSeconds) || 0;
            const timePlayed = Math.max(localTimePlayed, remoteTimePlayed);
            if (timePlayed > localTimePlayed) {
                localStorage.setItem("bodachicos_time_played", timePlayed);
            }

            const localMaxDist = parseFloat(localStorage.getItem("bodachicos_maxdist_puebla") || "0") || 0;
            const remoteMaxDist = parseFloat(activePlayerRemoteData && activePlayerRemoteData.maxDistPuebla) || 0;
            const maxDistPuebla = Math.max(localMaxDist, remoteMaxDist);
            if (maxDistPuebla > localMaxDist) {
                localStorage.setItem("bodachicos_maxdist_puebla", maxDistPuebla.toFixed(1));
            }
            const pueblaWon = (localStorage.getItem("bodachicos_puebla_won") === "true") || Boolean(activePlayerRemoteData && activePlayerRemoteData.pueblaWon) || (scoresObj.puebla >= METAS.puebla) || (maxDistPuebla >= 120);
            if (pueblaWon) {
                localStorage.setItem("bodachicos_puebla_won", "true");
            }

            const payload = {
                gamerTag: playerGamertag.trim(),
                guestId: cleanGuestId || keyTag,
                realName: playerRealName || selectedRealName || (activePlayerRemoteData && activePlayerRemoteData.realName) || "",
                partyId: currentPartyId || (activePlayerRemoteData && activePlayerRemoteData.partyId) || "general",
                scores: scoresObj,
                chiCoins: coinsObj,
                arcadeCoins: arcadeCoinsSum,
                hasAllMetasBonus: (allMetasBonus > 0),
                maxDistPuebla: maxDistPuebla,
                pueblaWon: pueblaWon,
                totalChiCoins: netTotalCoins,
                totalScore: totalScoreSum,
                timePlayedSeconds: timePlayed,
                lastUpdated: firebase.database.ServerValue.TIMESTAMP
            };

            activePlayerRemoteData = Object.assign({}, activePlayerRemoteData || {}, payload);

            // Guardar en el espacio aislado local de este keyTag para evitar cruces en el mismo dispositivo
            try {
                localStorage.setItem("bodachicos_scoped_" + keyTag, JSON.stringify(payload));
            } catch (e) {}

            if (isSandboxGuestMode) {
                updateSandboxLocalPlayer(keyTag, payload);
            } else {
                db.ref(PLAYERS_DB_PATH + "/" + keyTag).update(payload).catch(err => console.error("Error al sincronizar con Firebase:", err));
            }

            // Enviar analíticos a Google Sheets (Trix) silenciosamente (SOLO EN PRODUCCIÓN, no en modo Sandbox)
            if (!isSandboxGuestMode) {
                try {
                    const sheetPayload = {
                        action: "updateGameStats",
                        guestId: payload.guestId,
                        partyId: payload.partyId,
                        realName: payload.realName,
                        gamerTag: payload.gamerTag,
                        totalScore: payload.totalScore,
                        totalChiCoins: payload.totalChiCoins,
                        timePlayedSeconds: payload.timePlayedSeconds,
                        chicoScore: scoresObj.chico || 0,
                        chicaScore: scoresObj.chica || 0,
                        maddieScore: scoresObj.maddie || 0,
                        pueblaScore: scoresObj.puebla || 0,
                        maxDistPuebla: maxDistPuebla,
                        pueblaWon: pueblaWon
                    };
                    
                    fetch(APPS_SCRIPT_URL, {
                        method: 'POST',
                        mode: 'no-cors',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(sheetPayload)
                    }).catch(e => console.warn("Aviso: No se pudo enviar a Trix", e));
                } catch (e) {}
            }
        }

        function openLeaderboardModal() {
            document.getElementById("leaderboardModal").classList.remove("hidden");
            listenToLeaderboard();
        }

        function closeLeaderboardModal() {
            document.getElementById("leaderboardModal").classList.add("hidden");
        }

        function switchLeaderboardTab(tab) {
            currentLeaderboardTab = tab;
            
            const tabs = ['general', 'chico', 'chica', 'maddie', 'puebla'];
            tabs.forEach(t => {
                const btn = document.getElementById("tab-" + t);
                if (btn) {
                    if (t === tab) {
                        btn.className = "lb-tab px-3 py-1.5 rounded-xl bg-[#52582f] text-white font-bold transition shrink-0 shadow-xs";
                    } else {
                        btn.className = "lb-tab px-3 py-1.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 font-medium transition shrink-0";
                    }
                }
            });

            renderLeaderboardTable();
        }

        function listenToLeaderboard() {
            const tbody = document.getElementById("leaderboardTableBody");
            if (isSandboxGuestMode) {
                const sbMap = getSandboxLocalPlayers();
                if (sbMap) {
                    rawPlayersData = sbMap;
                    renderLeaderboardTable();
                    return;
                }
            }
            if (!db) {
                tbody.innerHTML = `<tr><td colspan="3" class="py-6 text-center text-gray-400 italic">Conectando a Firebase...</td></tr>`;
                return;
            }
            if (!isLeaderboardListening) {
                isLeaderboardListening = true;
                db.ref(PLAYERS_DB_PATH).on("value", (snapshot) => {
                    rawPlayersData = (isSandboxGuestMode && getSandboxLocalPlayers()) ? getSandboxLocalPlayers() : (snapshot.val() || {});
                    renderLeaderboardTable();
                });
            } else {
                renderLeaderboardTable();
            }
        }

        function renderLeaderboardTable() {
            const tbody = document.getElementById("leaderboardTableBody");
            const colTitle = document.getElementById("leaderboardScoreColTitle");
            const subtitle = document.getElementById("leaderboardSubtitle");

            if (!tbody) return;

            const tabInfo = isEnLang ? {
                general: { col: "Total Score", sub: "Real-time global leaderboard across all 4 mini-games" },
                chico: { col: "High Score (Pts)", sub: "Chicosaurus (Groom) leaderboard" },
                chica: { col: "High Score (Pts)", sub: "Love in the Air (Bride) leaderboard" },
                maddie: { col: "High Score (Clicks)", sub: "Whack-a-Maddie! leaderboard" },
                puebla: { col: "High Score (Pts)", sub: "Road to Puebla leaderboard" }
            } : {
                general: { col: "Puntos Totales", sub: "Ranking general de puntajes acumulados en todos los minijuegos" },
                chico: { col: "Récord (Pts)", sub: "Ranking de puntuación en Chicosaurio (Chico)" },
                chica: { col: "Récord (Pts)", sub: "Ranking de puntuación en Atrapa el Amor (Chica)" },
                maddie: { col: "Récord (Clics)", sub: "Ranking de clics en Atrapa a Maddie" },
                puebla: { col: "Récord (Pts)", sub: "Ranking de puntuación en Camino a Puebla" }
            };

            if (colTitle && tabInfo[currentLeaderboardTab]) colTitle.innerText = tabInfo[currentLeaderboardTab].col;
            if (subtitle && tabInfo[currentLeaderboardTab]) subtitle.innerText = tabInfo[currentLeaderboardTab].sub;

            // Deduplicación por guestId inmutable y por gamerTag (prefiriendo el perfil con Guest ID / nombre real)
            const uniqueMap = {};
            Object.keys(rawPlayersData).forEach(k => {
                if (k.startsWith("__")) return;
                const p = rawPlayersData[k];
                if (!p || !p.gamerTag) return;
                const formattedId = formatGuestId(p.guestId || k);
                const dedupeKey = formattedId || ("tag_" + p.gamerTag.trim().toLowerCase());
                if (!uniqueMap[dedupeKey]) {
                    uniqueMap[dedupeKey] = p;
                } else {
                    const existing = uniqueMap[dedupeKey];
                    const existingScore = typeof existing.totalScore === "number" ? existing.totalScore : 0;
                    const pScore = typeof p.totalScore === "number" ? p.totalScore : 0;
                    const pHasRealName = Boolean(p.realName && p.realName.trim());
                    const exHasRealName = Boolean(existing.realName && existing.realName.trim());
                    if (pScore > existingScore || (pScore === existingScore && pHasRealName && !exHasRealName) || (pScore === existingScore && pHasRealName === exHasRealName && (p.lastUpdated || 0) > (existing.lastUpdated || 0))) {
                        uniqueMap[dedupeKey] = Object.assign({}, existing, p, {
                            realName: (p.realName && p.realName.trim()) || existing.realName || "",
                            guestId: formattedId || formatGuestId(existing.guestId) || p.guestId
                        });
                    } else if (!exHasRealName && pHasRealName) {
                        existing.realName = p.realName.trim();
                    }
                }
            });
            // Segunda pasada para fusionar si un mismo gamerTag quedó tanto con GID_ como con tag_
            const byTagMap = {};
            Object.values(uniqueMap).forEach(p => {
                const tagKey = (p.gamerTag || "").trim().toLowerCase();
                if (!tagKey) return;
                if (!byTagMap[tagKey]) {
                    byTagMap[tagKey] = p;
                } else {
                    const ex = byTagMap[tagKey];
                    const exGid = formatGuestId(ex.guestId);
                    const pGid = formatGuestId(p.guestId);
                    if ((pGid && !exGid) || ((p.totalScore || 0) > (ex.totalScore || 0))) {
                        byTagMap[tagKey] = Object.assign({}, ex, p, {
                            realName: (p.realName && p.realName.trim()) || ex.realName || "",
                            guestId: pGid || exGid || p.guestId
                        });
                    }
                }
            });
            const list = Object.values(byTagMap);

            if (list.length === 0) {
                tbody.innerHTML = `<tr><td colspan="3" class="py-6 text-center text-gray-400 italic">${isEnLang ? "No records recorded yet. Be the first!" : "Aún no hay récords registrados. ¡Sé el primero!"}</td></tr>`;
                return;
            }

            const getScoreVal = (player, tab) => {
                if (tab === "general") {
                    if (typeof player.totalScore === "number") return player.totalScore;
                    return (
                        (player.scores?.chico || 0) + 
                        (player.scores?.chica || 0) + 
                        (player.scores?.maddie || 0) + 
                        (player.scores?.puebla || 0)
                    );
                }
                return (player.scores && typeof player.scores[tab] === "number") ? player.scores[tab] : 0;
            };

            list.sort((a, b) => getScoreVal(b, currentLeaderboardTab) - getScoreVal(a, currentLeaderboardTab));

            let html = "";
            list.forEach((player, idx) => {
                let posBadge = `<span class="font-bold text-gray-500">${idx + 1}</span>`;
                if (idx === 0) posBadge = `<span class="text-xl">🥇</span>`;
                else if (idx === 1) posBadge = `<span class="text-xl">🥈</span>`;
                else if (idx === 2) posBadge = `<span class="text-xl">🥉</span>`;

                const isCurrent = player.gamerTag === playerGamertag;
                const rowClass = isCurrent ? "bg-amber-50 font-bold text-amber-900" : "";
                const scoreVal = getScoreVal(player, currentLeaderboardTab);
                const unit = currentLeaderboardTab === "maddie" ? "clics" : "pts";
                const realNameDisplay = player.realName && player.realName !== "Invitado No Registrado" ? ` <span class="text-xs font-normal text-gray-500">(${player.realName})</span>` : '';
                const youBadge = isEnLang ? ' <span class="text-xs font-bold text-amber-700">(You)</span>' : ' <span class="text-xs font-bold text-amber-700">(Tú)</span>';

                html += `
                    <tr class="${rowClass} hover:bg-gray-50 transition">
                        <td class="py-2.5 px-2">${posBadge}</td>
                        <td class="py-2.5 px-2 font-medium text-gray-800">${player.gamerTag || (isEnLang ? 'Anonymous' : 'Anónimo')}${realNameDisplay}${isCurrent ? youBadge : ''}</td>
                        <td class="py-2.5 px-2 text-right font-monogram font-bold text-amber-800 text-base">${scoreVal.toLocaleString()} ${unit}</td>
                    </tr>
                `;
            });
            tbody.innerHTML = html;
        }

        // CONTROL DE ACCESO ADMINISTRADOR
        function openAdminAuthModal() {
            document.getElementById("adminAuthError").classList.add("hidden");
            document.getElementById("adminPasswordInput").value = "";
            document.getElementById("adminAuthModal").classList.remove("hidden");
            setTimeout(() => {
                const el = document.getElementById("adminPasswordInput");
                if (el) el.focus();
            }, 100);
        }

        function closeAdminAuthModal() {
            document.getElementById("adminAuthModal").classList.add("hidden");
        }

        function submitAdminPassword() {
            const val = document.getElementById("adminPasswordInput").value.trim();
            if (val.toLowerCase() === "souvenir") {
                sessionStorage.setItem("bodachicos_admin_auth", "true");
                window.location.href = isEnLang ? "../admin.html" : "admin.html";
            } else {
                document.getElementById("adminAuthError").classList.remove("hidden");
            }
        }

        // INICIALIZACIÓN
        document.addEventListener("DOMContentLoaded", () => {
            if (isSandboxGuestMode) {
                const banner = document.createElement("div");
                banner.className = "bg-purple-800 text-purple-100 text-xs font-bold py-2 px-4 text-center flex justify-center items-center gap-3 shadow-md";
                banner.innerHTML = `<span>🧪 MODO PRUEBAS (SANDBOX) ACTIVO — Conectado a copia de pruebas</span> <a href="${window.location.pathname}" class="underline bg-purple-950/60 px-2.5 py-0.5 rounded-lg text-[11px] hover:bg-purple-950">Salir a Producción 🟢</a>`;
                document.body.prepend(banner);
            }
            checkGamertag();
            updateScoresDashboard();
        });

        function closeGamertagModal() {
            const modal = document.getElementById("gamertagModal");
            if (modal) {
                modal.classList.add("hidden");
                modal.style.display = "none";
            }
        }

        function clearLocalPlayerScores() {
            ['chico', 'chica', 'maddie', 'puebla'].forEach(g => {
                localStorage.removeItem('bodachicos_score_' + g);
            });
            localStorage.removeItem('bodachicos_admin_bonus');
            localStorage.removeItem('bodachicos_bonus_chicoins');
            localStorage.removeItem('bodachicos_maxdist_puebla');
            localStorage.removeItem('bodachicos_puebla_won');
            localStorage.removeItem('bodachicos_time_played');
            activePlayerRemoteData = null;
        }

        let isLoadingPartyMembers = false;

        async function fetchAllPlayersMap() {
            if (isSandboxGuestMode) {
                const sbMap = getSandboxLocalPlayers();
                if (sbMap) return sbMap;
            }
            if (!db) return {};
            try {
                const snap = await db.ref(PLAYERS_DB_PATH).once("value");
                return (snap && snap.exists() && snap.val()) ? snap.val() : {};
            } catch (e) {
                console.warn("Error al leer lista de jugadores:", e);
                return {};
            }
        }

        function mergeMatchingPlayerRecords(matches, preferredKey) {
            if (!matches || matches.length === 0) return null;
            // Ordenar por lastUpdated ascendente para que el más reciente prevalezca en metadatos (ej. gamerTag)
            const sorted = matches.slice().sort((a, b) => ((a.data && a.data.lastUpdated) || 0) - ((b.data && b.data.lastUpdated) || 0));
            const merged = {};
            const mergedScores = { chico: 0, chica: 0, maddie: 0, puebla: 0 };
            const mergedCoins = { chico: 0, chica: 0, maddie: 0, puebla: 0 };
            let maxDist = 0;
            let wonPuebla = false;
            let maxTime = 0;
            const mergedActLogs = {};
            const mergedRedLogs = {};
            let bestKey = formatGuestId(preferredKey) || preferredKey || sorted[sorted.length - 1].key;

            sorted.forEach(({ key, data }) => {
                if (!data || typeof data !== "object") return;
                const validKeyGid = formatGuestId(key);
                if (validKeyGid && !formatGuestId(bestKey)) {
                    bestKey = validKeyGid;
                }
                Object.assign(merged, data);
                if (data.realName && data.realName.trim()) merged.realName = data.realName.trim();
                const validDataGid = formatGuestId(data.guestId);
                if (validDataGid) {
                    merged.guestId = validDataGid;
                    if (!formatGuestId(bestKey)) bestKey = validDataGid;
                }
                if (data.partyId && data.partyId !== "general" && data.partyId !== "chicos") merged.partyId = data.partyId;

                ["chico", "chica", "maddie", "puebla"].forEach(g => {
                    const s = parseInt(data.scores && data.scores[g]) || 0;
                    if (s > mergedScores[g]) mergedScores[g] = s;
                    mergedCoins[g] = calculateGameChiCoins(g, mergedScores[g]);
                });

                const dist = parseFloat(data.maxDistPuebla) || 0;
                if (dist > maxDist) maxDist = dist;
                if (data.pueblaWon || mergedScores.puebla >= METAS.puebla || maxDist >= 120) wonPuebla = true;

                const t = parseInt(data.timePlayedSeconds) || 0;
                if (t > maxTime) maxTime = t;

                if (data.activityLogs && typeof data.activityLogs === "object") {
                    Object.assign(mergedActLogs, data.activityLogs);
                }
                if (data.redemptionLogs && typeof data.redemptionLogs === "object") {
                    Object.assign(mergedRedLogs, data.redemptionLogs);
                }
            });

            merged.scores = mergedScores;
            merged.chiCoins = mergedCoins;
            merged.maxDistPuebla = maxDist;
            merged.pueblaWon = wonPuebla;
            merged.timePlayedSeconds = maxTime;
            if (Object.keys(mergedActLogs).length > 0) merged.activityLogs = mergedActLogs;
            if (Object.keys(mergedRedLogs).length > 0) merged.redemptionLogs = mergedRedLogs;
            if (formatGuestId(bestKey)) merged.guestId = formatGuestId(bestKey);

            return { key: bestKey, data: merged };
        }

        function applyPlayerScores(remoteData, keyTag, preserveHigherLocal = false) {
            const prevLocalScores = {};
            let prevLocalMaxDist = 0;
            let prevLocalPueblaWon = false;
            let prevLocalTimePlayed = 0;

            if (preserveHigherLocal) {
                ["chico", "chica", "maddie", "puebla"].forEach(g => {
                    prevLocalScores[g] = getScore(g);
                });
                prevLocalMaxDist = parseFloat(localStorage.getItem("bodachicos_maxdist_puebla") || "0") || 0;
                prevLocalPueblaWon = localStorage.getItem("bodachicos_puebla_won") === "true";
                prevLocalTimePlayed = parseInt(localStorage.getItem("bodachicos_time_played") || "0") || 0;
            }

            clearLocalPlayerScores();
            activePlayerRemoteData = remoteData || null;
            if (keyTag) {
                attachActivePlayerListener(keyTag);
            }

            let sourceData = remoteData;
            if (!sourceData && keyTag) {
                try {
                    sourceData = JSON.parse(localStorage.getItem("bodachicos_scoped_" + keyTag) || "null");
                } catch (e) {}
            }

            ["chico", "chica", "maddie", "puebla"].forEach(g => {
                const remVal = (sourceData && sourceData.scores) ? (parseInt(sourceData.scores[g]) || 0) : 0;
                const finalVal = preserveHigherLocal ? Math.max(remVal, prevLocalScores[g] || 0) : remVal;
                if (finalVal > 0) {
                    localStorage.setItem("bodachicos_score_" + g, finalVal);
                }
            });

            const remDist = sourceData ? (parseFloat(sourceData.maxDistPuebla) || 0) : 0;
            const finalDist = preserveHigherLocal ? Math.max(remDist, prevLocalMaxDist) : remDist;
            if (finalDist > 0) {
                localStorage.setItem("bodachicos_maxdist_puebla", finalDist.toFixed(1));
            }

            const remWon = Boolean(sourceData && (sourceData.pueblaWon || (sourceData.scores && sourceData.scores.puebla >= METAS.puebla) || remDist >= 120));
            if (remWon || (preserveHigherLocal && prevLocalPueblaWon) || getScore("puebla") >= METAS.puebla || finalDist >= 120) {
                localStorage.setItem("bodachicos_puebla_won", "true");
            }

            const remTime = sourceData ? (parseInt(sourceData.timePlayedSeconds) || 0) : 0;
            const finalTime = preserveHigherLocal ? Math.max(remTime, prevLocalTimePlayed) : remTime;
            if (finalTime > 0) {
                localStorage.setItem("bodachicos_time_played", finalTime);
            }

            updateScoresDashboard();
        }

        async function fetchPlayerRecordByGuest(guestId, realName) {
            const cleanGId = guestId ? formatGuestId(guestId) : "";
            const cleanName = realName ? realName.trim().toLowerCase() : "";
            const cleanParty = (currentPartyId && currentPartyId !== "chicos" && currentPartyId !== "general") ? currentPartyId.trim().toLowerCase() : "";
            const isSingleMemberParty = (partyMembersData && partyMembersData.length === 1);

            const allPlayers = await fetchAllPlayersMap();
            const matches = [];

            Object.entries(allPlayers).forEach(([k, v]) => {
                if (!v || typeof v !== "object" || k.startsWith("__")) return;
                const nodeGId = formatGuestId(v.guestId) || formatGuestId(k);
                const nodeName = (v.realName || "").trim().toLowerCase();
                const nodeParty = (v.partyId || "").trim().toLowerCase();

                let isMatch = false;
                if (cleanGId && (k === cleanGId || nodeGId === cleanGId)) {
                    isMatch = true;
                } else if (cleanName && nodeName && nodeName === cleanName) {
                    isMatch = true;
                } else if (isSingleMemberParty && cleanParty && nodeParty === cleanParty && (!nodeName || nodeName === cleanName)) {
                    isMatch = true;
                }

                if (isMatch) {
                    matches.push({ key: k, data: v });
                }
            });

            if (matches.length > 0) {
                return mergeMatchingPlayerRecords(matches, cleanGId);
            }
            return null;
        }

        async function fetchPlayerRecordByGamertag(gamertag) {
            if (!gamertag || !gamertag.trim()) return null;
            const cleanTag = gamertag.trim().replace(/[.#$/[\]]/g, "_").toLowerCase();
            const rawLower = gamertag.trim().toLowerCase();

            const allPlayers = await fetchAllPlayersMap();
            const matches = [];

            Object.entries(allPlayers).forEach(([k, v]) => {
                if (!v || typeof v !== "object" || k.startsWith("__")) return;
                const nodeTag = (v.gamerTag || "").trim().toLowerCase();
                if (k.toLowerCase() === cleanTag || (nodeTag && nodeTag === rawLower)) {
                    matches.push({ key: k, data: v });
                }
            });

            if (matches.length > 0) {
                return mergeMatchingPlayerRecords(matches, "");
            }
            return null;
        }

        async function checkGamertag() {
            playerGuestId = formatGuestId(localStorage.getItem("bodachicos_guest_id") || "");
            if (!playerGuestId) {
                localStorage.removeItem("bodachicos_guest_id");
            }
            playerGamertag = localStorage.getItem("bodachicos_gamertag") || "";
            playerRealName = localStorage.getItem("bodachicos_real_name") || "";

            const tagDisplay = playerGamertag ? playerGamertag : (isEnLang ? "Unregistered" : "Sin registrar");
            document.getElementById("playerGamertag").innerText = tagDisplay;
            document.getElementById("bottomGamerTag").innerText = tagDisplay;

            // Si NO hay Gamertag activo para este usuario, arrancar en ceros y abrir modal
            if (!playerGamertag) {
                clearLocalPlayerScores();
                updateScoresDashboard();
                prepareGamertagModal();
                return;
            }

            // Si SÍ hay un jugador activo, consultar Firebase primero para tener los datos más recientes
            if (db) {
                try {
                    let record = (playerGuestId || playerRealName) 
                        ? await fetchPlayerRecordByGuest(playerGuestId, playerRealName)
                        : null;
                    if (!record) {
                        record = await fetchPlayerRecordByGamertag(playerGamertag);
                    }

                    if (record && record.data) {
                        const validRecordGid = formatGuestId(record.key) || formatGuestId(record.data.guestId);
                        if (validRecordGid && playerGuestId !== validRecordGid) {
                            playerGuestId = validRecordGid;
                            localStorage.setItem("bodachicos_guest_id", playerGuestId);
                        }
                        if (record.data.realName && !playerRealName) {
                            playerRealName = record.data.realName;
                            localStorage.setItem("bodachicos_real_name", playerRealName);
                        }
                        applyPlayerScores(record.data, playerGuestId || record.key, true);
                        if (record.data.gamerTag && record.data.gamerTag !== playerGamertag) {
                            playerGamertag = record.data.gamerTag;
                            localStorage.setItem("bodachicos_gamertag", playerGamertag);
                            document.getElementById("playerGamertag").innerText = playerGamertag;
                            document.getElementById("bottomGamerTag").innerText = playerGamertag;
                        }
                        syncPlayerToFirebase();
                    } else {
                        // El jugador tiene Gamertag pero no existe en Firebase: conservar sus puntos locales y sincronizar
                        const localKey = playerGuestId || playerGamertag.trim().replace(/[.#$/[\]]/g, "_");
                        applyPlayerScores(null, localKey, true);
                        syncPlayerToFirebase();
                    }
                } catch (e) {
                    console.warn("Error al restaurar desde Firebase:", e);
                }
            }
        }

        async function prepareGamertagModal() {
            const modal = document.getElementById("gamertagModal");
            const container = document.getElementById("memberSelectContainer");
            const buttonsList = document.getElementById("memberButtonsList");
            const inputEl = document.getElementById("gamertagInput");
            const btn = document.getElementById("saveGamerTagBtn");
            const errorMsg = document.getElementById("gamertagErrorMsg");

            if (errorMsg) errorMsg.classList.add("hidden");

            // Si ya hay un jugador activo, preseleccionar sus datos
            selectedRealName = playerRealName || "";
            selectedGuestId = playerGuestId || "";

            if (inputEl) {
                inputEl.disabled = false;
                inputEl.value = playerGamertag || "";
                inputEl.placeholder = isEnLang ? "Nickname / Name" : "Tu Apodo / Nombre";
                inputEl.className = "w-full mt-2 p-3 border border-gray-200 rounded-xl text-center font-bold text-lg outline-none focus:border-olivo-base transition";
            }
            if (btn) {
                btn.disabled = false;
                btn.className = "w-full mt-3 bg-[#52582f] hover:bg-opacity-95 text-white font-bold py-3 rounded-xl transition shadow-md";
                btn.innerText = isEnLang ? "Start Playing 🎮" : "Comenzar a Jugar 🎮";
            }

            if (modal) {
                modal.classList.remove("hidden");
                modal.style.display = "flex";
            }

            if (currentPartyId && partyMembersData.length === 0) {
                isLoadingPartyMembers = true;
                if (container) container.classList.remove("hidden");
                if (buttonsList) {
                    buttonsList.innerHTML = `<p class="text-xs text-gray-400 italic py-2 text-center animate-pulse">⌛ ${isEnLang ? "Loading invitation members..." : "Cargando integrantes de la invitación..."}</p>`;
                }
                if (btn) {
                    btn.disabled = true;
                    btn.classList.add("opacity-70", "cursor-wait");
                    btn.innerText = isEnLang ? "Loading invitation... ⌛" : "Cargando invitación... ⌛";
                }

                try {
                    const res = await fetch(`${APPS_SCRIPT_URL}?id=${encodeURIComponent(currentPartyId)}`);
                    const data = await res.json();
                    if (data.status === "success") {
                        if (data.integrantesData && data.integrantesData.length > 0) {
                            partyMembersData = data.integrantesData.map(m => ({
                                id: formatGuestId(m.id),
                                name: (m.name || "").trim()
                            }));
                        } else if (data.integrantes) {
                            partyMembersData = data.integrantes.toString().split(",").map(s => ({ id: "", name: s.trim() }));
                        }
                        renderMemberButtons();
                    } else {
                        if (container) container.classList.add("hidden");
                    }
                } catch (e) {
                    console.warn("No se pudo cargar la lista de integrantes del RSVP:", e);
                    if (container) container.classList.add("hidden");
                } finally {
                    isLoadingPartyMembers = false;
                    if (btn) {
                        btn.disabled = false;
                        btn.classList.remove("opacity-70", "cursor-wait");
                        btn.innerText = isEnLang ? "Start Playing 🎮" : "Comenzar a Jugar 🎮";
                    }
                }
            } else if (partyMembersData && partyMembersData.length > 0) {
                if (container) container.classList.remove("hidden");
                renderMemberButtons();
            } else {
                if (container) container.classList.add("hidden");
            }
        }

        function renderMemberButtons() {
            const buttonsList = document.getElementById("memberButtonsList");
            const container = document.getElementById("memberSelectContainer");
            if (!buttonsList) return;

            if (!partyMembersData || partyMembersData.length === 0) {
                if (container) container.classList.add("hidden");
                return;
            }

            if (container) container.classList.remove("hidden");
            buttonsList.innerHTML = "";

            let defaultIdx = -1;
            if (selectedRealName || playerRealName) {
                const target = (selectedRealName || playerRealName).toLowerCase();
                const found = partyMembersData.findIndex(m => m.name.toLowerCase() === target);
                if (found >= 0) defaultIdx = found;
            }
            if (defaultIdx === -1 && partyMembersData.length === 1) {
                defaultIdx = 0;
            }

            if (defaultIdx >= 0) {
                selectedRealName = partyMembersData[defaultIdx].name;
                selectedGuestId = partyMembersData[defaultIdx].id;
            }

            partyMembersData.forEach((memberObj, idx) => {
                const isSel = (idx === defaultIdx);
                const btn = document.createElement("button");
                btn.type = "button";
                btn.onclick = () => selectMemberChoice(idx, memberObj.name, memberObj.id);
                btn.className = `w-full text-left px-3 py-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-between member-btn ${isSel ? 'border-olivo-base bg-amber-50 text-olivo-base shadow-xs' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`;
                btn.innerHTML = `<span>👤 ${memberObj.name}</span><span class="check-icon ${isSel ? '' : 'hidden'} font-bold">✓</span>`;
                buttonsList.appendChild(btn);
            });

            // Si se autoseleccionó un integrante (ej. invitación individual) y aún no hemos cargado su perfil remoto, cargarlo sin borrar lo que haya escrito
            if (defaultIdx >= 0 && !activePlayerRemoteData) {
                selectMemberChoice(defaultIdx, partyMembersData[defaultIdx].name, partyMembersData[defaultIdx].id, true);
            }
        }

        async function selectMemberChoice(idx, memberName, memberId, preserveTypedInput = false) {
            const isSameActivePlayer = Boolean(
                (playerGuestId && formatGuestId(memberId) === playerGuestId) ||
                (playerRealName && (memberName || "").trim().toLowerCase() === playerRealName.trim().toLowerCase())
            );
            selectedRealName = (memberName || "").trim();
            selectedGuestId = formatGuestId(memberId);

            // Resaltar visualmente el botón seleccionado al instante
            const buttons = document.querySelectorAll("#memberButtonsList .member-btn");
            const checks = document.querySelectorAll("#memberButtonsList .check-icon");
            buttons.forEach((btn, i) => {
                if (i === idx) {
                    btn.className = "w-full text-left px-3 py-2.5 rounded-xl border border-olivo-base bg-amber-50 text-olivo-base font-bold shadow-xs transition flex items-center justify-between member-btn";
                    if (checks[i]) checks[i].classList.remove("hidden");
                } else {
                    btn.className = "w-full text-left px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 text-xs font-bold transition flex items-center justify-between member-btn";
                    if (checks[i]) checks[i].classList.add("hidden");
                }
            });

            const inputEl = document.getElementById("gamertagInput");
            const errorMsg = document.getElementById("gamertagErrorMsg");
            if (errorMsg) errorMsg.classList.add("hidden");

            // Consultar Firebase ÚNICAMENTE para este integrante específico
            try {
                const record = await fetchPlayerRecordByGuest(selectedGuestId, selectedRealName);
                if (record && record.data) {
                    // El jugador ya tiene perfil en Firebase: cargar sus scores reales y pre-llenar su GamerTag
                    applyPlayerScores(record.data, selectedGuestId || record.key, isSameActivePlayer);
                    if (inputEl && (!preserveTypedInput || !inputEl.value.trim())) {
                        inputEl.value = record.data.gamerTag || "";
                    }
                } else {
                    // El jugador no tiene perfil en Firebase aún
                    applyPlayerScores(null, selectedGuestId, isSameActivePlayer);
                    if (inputEl && !preserveTypedInput && !isSameActivePlayer) {
                        inputEl.value = "";
                    }
                }
            } catch (e) {
                console.warn("Error al consultar Firebase en selectMemberChoice:", e);
                applyPlayerScores(null, selectedGuestId, isSameActivePlayer);
            }

            // NOTA: NO llamamos a inputEl.focus() para evitar abrir automáticamente el teclado del celular.
        }

        function showReservedTagEasterEgg(type, rawName) {
            let existing = document.getElementById("reservedTagModalOverlay");
            if (existing) existing.remove();

            const isMaddie = (type === "maddie");
            if (isMaddie) {
                playSound('bark');
                setTimeout(() => playSound('bark'), 220);
            } else {
                playSound('wedding_horn');
            }

            const overlay = document.createElement("div");
            overlay.id = "reservedTagModalOverlay";
            overlay.className = "fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4";
            
            const title = isMaddie 
                ? (isEnLang ? "👑 Maddie, Queen of the Arcade!" : "👑 ¡Maddie, Reina del Arcade!")
                : (isEnLang ? "💒 Reserved for the Bride & Groom!" : "💒 ¡Reservado para los Novios!");
            
            const desc = isMaddie
                ? (isEnLang 
                    ? "🐾 Woof! You invoked Maddie! This GamerTag is exclusively reserved for the official wedding puppy. Please create your own gamer nickname to compete!" 
                    : "🐾 ¡Woof! ¡Has invocado a Maddie! Este GamerTag está apartado exclusivamente para la perrihija oficial de la boda. ¡Por favor inventa tu propio apodo de jugador para competir!")
                : (isEnLang
                    ? "💒 That name belongs to the wedding couple! Mariana & Memo appreciate your love, but please pick your own gamer nickname for the Leaderboard!"
                    : "💒 ¡Ese nombre le pertenece a los Novios! Mariana & Memo agradecen tu cariño, pero este apodo es exclusivo para ellos. ¡Elige tu propio apodo de jugador para subir al Leaderboard!");

            const icon = isMaddie ? "🐶👑" : "👰🏻‍♀️🤵🏻‍♂️";

            overlay.innerHTML = `
                <div class="bg-gradient-to-b from-amber-50 to-amber-100 border-4 border-amber-400 p-6 rounded-3xl max-w-sm w-full text-center shadow-2xl font-monogram">
                    <div class="text-6xl mb-3">${icon}</div>
                    <h3 class="text-xl md:text-2xl font-extrabold text-amber-950 mb-2">${title}</h3>
                    <p class="text-sm text-amber-900 leading-relaxed mb-6 font-sans font-medium">${desc}</p>
                    <button id="closeReservedModalBtn" class="w-full bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold py-3 px-6 rounded-2xl shadow-lg transition-all text-sm font-sans">
                        ${isEnLang ? "Choose my own GamerTag 🎮" : "Elegir mi propio GamerTag 🎮"}
                    </button>
                </div>
            `;

            document.body.appendChild(overlay);

            document.getElementById("closeReservedModalBtn").onclick = () => {
                overlay.remove();
                const inp = document.getElementById("gamertagInput");
                if (inp) {
                    inp.value = "";
                    inp.focus();
                }
            };
        }

        async function saveGamerTag() {
            if (isLoadingPartyMembers) return;

            const errorMsg = document.getElementById("gamertagErrorMsg");
            if (errorMsg) errorMsg.classList.add("hidden");

            const container = document.getElementById("memberSelectContainer");
            const isSelectVisible = container && !container.classList.contains("hidden");

            if (isSelectVisible && partyMembersData.length > 0 && (!selectedRealName || !selectedGuestId)) {
                if (errorMsg) {
                    errorMsg.innerText = isEnLang ? "👆 Please select who you are from the list above." : "👆 Por favor selecciona qué invitado eres de la lista superior.";
                    errorMsg.classList.remove("hidden");
                }
                return;
            }

            const val = (document.getElementById("gamertagInput").value || "").trim();
            if (!val) {
                if (errorMsg) {
                    errorMsg.innerText = isEnLang ? "❌ Enter a GamerTag (Nickname) to play." : "❌ Escribe un GamerTag (Apodo) para jugar.";
                    errorMsg.classList.remove("hidden");
                }
                return;
            }

            const cleanNormalizedTag = val.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
            const reservedMap = {
                "maddie": "maddie",
                "maddiux": "maddie",
                "perrihija": "maddie",
                "chico": "novios",
                "chicos": "novios",
                "chica": "novios",
                "memo": "novios",
                "mariana": "novios",
                "guillermo": "novios"
            };
            if (reservedMap[cleanNormalizedTag]) {
                showReservedTagEasterEgg(reservedMap[cleanNormalizedTag], val);
                return;
            }

            const btn = document.getElementById("saveGamerTagBtn");
            if (btn) {
                btn.innerText = isEnLang ? "Connecting to Arcade..." : "Conectando al Arcade...";
                btn.disabled = true;
                btn.classList.add("opacity-70", "cursor-wait");
            }

            let effectiveGuestId = formatGuestId(selectedGuestId || playerGuestId);
            let effectiveRealName = (selectedRealName || playerRealName || "").trim();

            // Validar en memoria si el gamertag ya está en uso por OTRA persona y recuperar récords previos del invitado
            if (db) {
                try {
                    const allPlayers = await fetchAllPlayersMap();
                    const lowerVal = val.toLowerCase();
                    const isTakenByOther = Object.entries(allPlayers).some(([k, node]) => {
                        if (!node || typeof node !== "object" || k.startsWith("__")) return false;
                        const nodeTag = (node.gamerTag || "").trim().toLowerCase();
                        if (nodeTag !== lowerVal) return false;

                        const nodeGId = formatGuestId(node.guestId) || formatGuestId(k);
                        const nodeName = (node.realName || "").trim().toLowerCase();

                        if (effectiveGuestId && nodeGId && nodeGId === effectiveGuestId) return false;
                        if (effectiveRealName && nodeName && nodeName === effectiveRealName.toLowerCase()) return false;
                        if (!effectiveGuestId && !effectiveRealName && playerGamertag && nodeTag === playerGamertag.trim().toLowerCase()) return false;
                        return true;
                    });

                    if (isTakenByOther) {
                        if (errorMsg) {
                            errorMsg.innerText = isEnLang ? `❌ GamerTag '${val}' is already taken. Please choose another.` : `❌ El GamerTag '${val}' ya está en uso por otro invitado. Por favor elige otro.`;
                            errorMsg.classList.remove("hidden");
                        }
                        if (btn) {
                            btn.innerText = isEnLang ? "Start Playing 🎮" : "Comenzar a Jugar 🎮";
                            btn.disabled = false;
                            btn.classList.remove("opacity-70", "cursor-wait");
                        }
                        return;
                    }

                    // Asegurar que antes de guardar el nuevo GamerTag siempre se fusionen los puntos históricos del invitado en Firebase
                    const existingRecord = (effectiveGuestId || effectiveRealName)
                        ? await fetchPlayerRecordByGuest(effectiveGuestId, effectiveRealName)
                        : await fetchPlayerRecordByGamertag(playerGamertag || val);

                    if (existingRecord && existingRecord.data) {
                        const foundGid = formatGuestId(existingRecord.key) || formatGuestId(existingRecord.data.guestId);
                        if (!effectiveGuestId && foundGid) effectiveGuestId = foundGid;
                        if (!effectiveRealName && existingRecord.data.realName) effectiveRealName = existingRecord.data.realName.trim();

                        const isSamePlayer = Boolean(
                            !playerGuestId ||
                            playerGuestId === effectiveGuestId ||
                            (playerRealName && effectiveRealName && playerRealName.toLowerCase() === effectiveRealName.toLowerCase())
                        );
                        applyPlayerScores(existingRecord.data, effectiveGuestId || existingRecord.key, isSamePlayer);
                    }
                } catch (e) {
                    console.warn("Aviso al verificar perfil existente en saveGamerTag:", e);
                }
            }

            // Establecer la sesión activa LIGADA a la persona elegida
            playerGuestId = effectiveGuestId;
            playerRealName = effectiveRealName;
            playerGamertag = val;

            localStorage.setItem("bodachicos_gamertag", playerGamertag);
            if (playerRealName) localStorage.setItem("bodachicos_real_name", playerRealName);
            if (playerGuestId) {
                localStorage.setItem("bodachicos_guest_id", playerGuestId);
            } else {
                localStorage.removeItem("bodachicos_guest_id");
            }

            if (btn) {
                btn.innerText = isEnLang ? "Start Playing 🎮" : "Comenzar a Jugar 🎮";
                btn.disabled = false;
                btn.classList.remove("opacity-70", "cursor-wait");
            }

            document.getElementById("playerGamertag").innerText = playerGamertag;
            document.getElementById("bottomGamerTag").innerText = playerGamertag;

            closeGamertagModal();
            updateScoresDashboard();
            syncPlayerToFirebase();
        }

        function changeGamerTagPrompt() {
            const errorMsg = document.getElementById("gamertagErrorMsg");
            if (errorMsg) errorMsg.classList.add("hidden");
            prepareGamertagModal();
        }

        function getScore(game) {
            const val = parseInt(localStorage.getItem("bodachicos_score_" + game) || "0");
            return isNaN(val) ? 0 : val;
        }

        function saveScore(game, newScore) {
            const current = getScore(game);
            if (newScore > current) {
                localStorage.setItem("bodachicos_score_" + game, newScore);
                const keyTag = playerGuestId || (playerGamertag ? playerGamertag.trim().replace(/[.#$/[\]]/g, "_") : "");
                if (keyTag) {
                    try {
                        const scoped = JSON.parse(localStorage.getItem("bodachicos_scoped_" + keyTag) || "{}");
                        if (!scoped.scores) scoped.scores = {};
                        scoped.scores[game] = newScore;
                        localStorage.setItem("bodachicos_scoped_" + keyTag, JSON.stringify(scoped));
                    } catch (e) {}
                }
            }
        }

        function updateScoresDashboard() {
            let totalMetasSuperadas = 0;

            Object.keys(METAS).forEach(game => {
                const gameScore = getScore(game);
                const target = METAS[game];
                const coinsEarned = calculateGameChiCoins(game, gameScore);

                document.getElementById("score-" + game).innerText = gameScore;
                const coinsEl = document.getElementById("chicoins-" + game);
                if (coinsEl) coinsEl.innerText = coinsEarned.toLocaleString();

                const badge = document.getElementById("badge-" + game);
                let isGamePassed = false;
                if (game === 'puebla') {
                    const pueblaDist = parseFloat(localStorage.getItem("bodachicos_maxdist_puebla") || "0");
                    isGamePassed = localStorage.getItem("bodachicos_puebla_won") === "true" || gameScore >= target || pueblaDist >= 120;
                } else {
                    isGamePassed = gameScore >= target;
                }

                if (isGamePassed) {
                    badge.innerText = isEnLang ? "Completed! ✓" : "¡Completado! ✓";
                    badge.className = "text-xs px-2 py-1 rounded-full font-bold bg-green-100 text-green-700 font-monogram text-sm";
                    totalMetasSuperadas++;
                } else {
                    badge.innerText = isEnLang ? "Pending" : "Pendiente";
                    badge.className = "text-xs px-2 py-1 rounded-full font-bold bg-yellow-100 text-yellow-700 font-monogram text-sm";
                }
            });

            let maxDistPuebla = parseFloat(localStorage.getItem("bodachicos_maxdist_puebla") || "0");
            const isPueblaWon = (localStorage.getItem("bodachicos_puebla_won") === "true") || (getScore('puebla') >= METAS.puebla);
            if (isPueblaWon && maxDistPuebla < 120) {
                maxDistPuebla = 120.0;
                localStorage.setItem("bodachicos_maxdist_puebla", "120.0");
                localStorage.setItem("bodachicos_puebla_won", "true");
            }
            const distPueblaEl = document.getElementById("dist-puebla");
            if (distPueblaEl) distPueblaEl.innerText = maxDistPuebla.toFixed(1);

            const grandTotalCoins = getTotalChiCoins();
            const totalDisplay = document.getElementById("totalChiCoinsDisplay");
            if (totalDisplay) totalDisplay.innerText = grandTotalCoins.toLocaleString();

            const prizeStatus = document.getElementById("prizeStatus");
            if (totalMetasSuperadas === 4) {
                prizeStatus.innerHTML = isEnLang 
                    ? "🏆 Prize Unlocked! (+500 Bonus ChiCoins) Redeem your prize at our wedding." 
                    : "🏆 ¡Premio Desbloqueado! (+500 ChiCoins de Bono) Canjea tu premio el día de la boda.";
                prizeStatus.className = "bg-green-600 text-white px-3 py-2 rounded-xl text-xs font-bold text-center animate-bounce shadow-md font-monogram";
            } else {
                prizeStatus.innerHTML = isEnLang ? `Progress: ${totalMetasSuperadas}/4 targets` : `Progreso: ${totalMetasSuperadas}/4 metas`;
                prizeStatus.className = "bg-gray-100 text-gray-500 px-3 py-2 rounded-xl text-xs font-semibold text-center";
            }

            syncPlayerToFirebase();
        }

        // DIBUJADO DE MARCADORES RETRO EN CANVAS (FUENTES MONOGRAM)
        function drawRetroScore(ctx, score, x, y) {
            ctx.save();
            ctx.font = "24px 'Monogram'";
            ctx.fillStyle = "#ffcc00"; // Amarillo Pac-Man
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 3.5;
            ctx.textAlign = "right";
            
            // Texto superior
            ctx.strokeText("1P SCORE", x, y);
            ctx.fillText("1P SCORE", x, y);
            
            // Marcador
            const padded = score.toString().padStart(5, '0');
            ctx.strokeText(padded, x, y + 16);
            ctx.fillText(padded, x, y + 16);
            ctx.restore();
        }

        function openGame(game) {
            activeGame = game;
            document.getElementById("gameContainer").classList.remove("hidden");
            document.body.style.overflow = "hidden"; // Deshabilita scroll de fondo

            const gameTitles = isEnLang ? {
                chico: "Chicosaurus",
                chica: "Love in the Air",
                maddie: "Whack-a-Maddie!",
                puebla: "Road to Puebla: OutRun 80s"
            } : {
                chico: "Chicosaurio",
                chica: "Atrapa el Amor",
                maddie: "Atrapa a Maddie",
                puebla: "Camino a Puebla: OutRun 80s"
            };
            const gameIcons = { chico: "🦖", chica: "👸", maddie: "🐶", puebla: "🚗" };

            document.getElementById("activeGameTitle").innerText = gameTitles[game];
            document.getElementById("activeGameIcon").innerText = gameIcons[game];
            
            // Ocultar scanlines CRT en 'chica' para que el emoji y la novia no tengan granulado/efecto tele
            const crtEl = document.getElementById("crtOverlay");
            if (crtEl) {
                crtEl.style.display = (game === 'chica') ? "none" : "";
            }

            resetGameUI();
        }

        function resetGameUI() {
            if (gameRunning && gameStartTime) {
                const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
                const total = parseInt(localStorage.getItem("bodachicos_time_played") || "0") + elapsed;
                localStorage.setItem("bodachicos_time_played", total);
                gameStartTime = 0;
            }
            gameRunning = false;
            clearInterval(gameInterval);
            score = 0;
            
            currentGameState.innerText = isEnLang ? "Waiting to start" : "Esperando inicio";
            currentGameScore.innerText = "00000";

            canvas.classList.add("hidden");
            document.getElementById("maddieContainer").classList.add("hidden");
            gameOverlay.classList.remove("hidden");
            overlayScoreBox.classList.add("hidden"); 
            
            // Escondemos los elementos gráficos de Game Over
            document.getElementById("gameOverTitleContainer").classList.add("hidden");
            document.getElementById("restartSpriteCanvas").classList.add("hidden");
            
            // Restauramos el botón estándar con el texto original
            const startBtn = document.getElementById("startGameBtn");
            startBtn.innerText = isEnLang ? "Play" : "Jugar";
            startBtn.classList.remove("hidden");
            startBtn.onclick = startActiveGame;

            const targetScore = METAS[activeGame];
            let inst = "";
            if (activeGame === 'chico') {
                inst = isEnLang 
                    ? `<div class="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-monogram text-[11px] py-1 px-2.5 rounded-lg text-center font-bold tracking-wider mb-2 shadow-inner border border-gray-200/60">🌐 NO INTERNET — CONNECTING TO OUR LOVE...</div>Jump by tapping or SPACE to dodge meetings <img src="${assetPrefix}SpritesNecesarios/calendario.png" class="inline w-4 h-4 mx-0.5 object-contain">, alarms <img src="${assetPrefix}SpritesNecesarios/Dino/Software_Clock_Time_Wait_Alarm_Sleep_Wake_Up_pixel.png" class="inline w-4 h-4 mx-0.5 object-contain"> and emails <img src="${assetPrefix}SpritesNecesarios/Dino/Software_Email_Message_Unread_Closed_pixel.png" class="inline w-4 h-4 mx-0.5 object-contain">. Catch gamepads <img src="${assetPrefix}SpritesNecesarios/Dino/Controller_Gamepad_pixel.png" class="inline w-4 h-4 mx-0.5 object-contain"> (+15 pts).<br>Target: ${targetScore} pts.`
                    : `<div class="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-monogram text-[11px] py-1 px-2.5 rounded-lg text-center font-bold tracking-wider mb-2 shadow-inner border border-gray-200/60">🌐 NO INTERNET — CONECTANDO AL AMOR DE LOS CHICOS...</div>Salta tocando la pantalla o con ESPACIO para esquivar juntas <img src="${assetPrefix}SpritesNecesarios/calendario.png" class="inline w-4 h-4 mx-0.5 object-contain">, alarmas <img src="${assetPrefix}SpritesNecesarios/Dino/Software_Clock_Time_Wait_Alarm_Sleep_Wake_Up_pixel.png" class="inline w-4 h-4 mx-0.5 object-contain"> y correos <img src="${assetPrefix}SpritesNecesarios/Dino/Software_Email_Message_Unread_Closed_pixel.png" class="inline w-4 h-4 mx-0.5 object-contain">. Atrapa controles <img src="${assetPrefix}SpritesNecesarios/Dino/Controller_Gamepad_pixel.png" class="inline w-4 h-4 mx-0.5 object-contain"> (+15 pts).<br>Meta: ${targetScore} pts.`;
            } else if (activeGame === 'chica') {
                inst = isEnLang 
                    ? `Move Mariana (👰🏻) by tapping or dragging to catch falling hearts (💖) and rings (💍). Dodge storm clouds (🌩️)!<br>Target: ${targetScore} pts.`
                    : `Mueve a la Novia (👰🏻) tocando o arrastrando tu dedo para atrapar corazones (💖) y anillos (💍). ¡Esquiva tormentas (🌩️)!<br>Meta: ${targetScore} pts.`;
            } else if (activeGame === 'maddie') {
                inst = isEnLang 
                    ? `Tap Maddie (🐶) when she pops out of garden holes. You have 30s. Watch out for poop (💩)!<br>Target: ${targetScore} clicks.`
                    : `Toca a Maddie (🐶) cuando asome de los hoyos. Tienes 30s. ¡Cuidado con popós (💩)!<br>Meta: ${targetScore} clics.`;
            } else if (activeGame === 'puebla') {
                inst = isEnLang 
                    ? `Use ⬅️ / ➡️, swipe left/right (recommended) or tap sides to drive to Puebla. Dodge traffic, potholes (🕳️) and works (🚧). Collect chalupas (🌮) and boosts (⚡)!<br>Target: 120 km to reach Cholula (200+ pts).`
                    : `Usa flechas ⬅️ / ➡️, desliza tu dedo (swipe recomendado) o toca los lados para conducir a Puebla. Esquiva tráfico, baches (🕳️) u obras (🚧). ¡Toma chalupas (🌮) y turbos (⚡)!<br>Meta: 120 km para llegar a Cholula (200+ pts).`;
            }
            
            overlayInstructions.innerHTML = inst; 
        }

        function closeActiveGame() {
            clearInterval(gameInterval);
            gameRunning = false;
            if (typeof bgMusic !== 'undefined') {
                bgMusic.pause();
                bgMusic.currentTime = 0;
            }
            if (typeof sfxSpaceEngine !== 'undefined') {
                try {
                    sfxSpaceEngine.pause();
                    sfxSpaceEngine.currentTime = 0;
                } catch (e) {}
            }
            if (typeof sfxCarHonk !== 'undefined') {
                try {
                    sfxCarHonk.pause();
                    sfxCarHonk.currentTime = 0;
                } catch (e) {}
            }
            if (typeof sfxMaddieBark !== 'undefined') {
                try {
                    sfxMaddieBark.pause();
                    sfxMaddieBark.currentTime = 0;
                } catch (e) {}
            }

            canvas.onclick = null;
            canvas.ontouchstart = null;
            canvas.onmousemove = null;
            canvas.ontouchmove = null;

            if (chicoKeyDownHandler) {
                window.removeEventListener("keydown", chicoKeyDownHandler);
                chicoKeyDownHandler = null;
            }
            if (chicoKeyUpHandler) {
                window.removeEventListener("keyup", chicoKeyUpHandler);
                chicoKeyUpHandler = null;
            }
            if (pueblaKeyDownHandler) {
                window.removeEventListener("keydown", pueblaKeyDownHandler);
                pueblaKeyDownHandler = null;
            }
            if (maddieTimer) {
                clearTimeout(maddieTimer);
                maddieTimer = null;
            }

            document.getElementById("gameContainer").classList.add("hidden");
            document.body.style.overflow = ""; 
            updateScoresDashboard();
        }

        function startActiveGame() {
            initAudio(); 
            
            // Iniciar música de fondo según el juego
            if (activeGame === 'chico') {
                bgMusic.src = assetPrefix + 'Music/juego_dino.mp3';
                bgMusic.play().catch(e => console.log('Bloqueo de audio', e));
            } else if (activeGame === 'chica') {
                bgMusic.src = assetPrefix + 'Music/juego_novia.mp3';
                bgMusic.play().catch(e => console.log('Bloqueo de audio', e));
            } else if (activeGame === 'maddie') {
                bgMusic.src = assetPrefix + 'Music/juego_maddie.mp3';
                bgMusic.play().catch(e => console.log('Bloqueo de audio', e));
            } else if (activeGame === 'puebla') {
                bgMusic.src = assetPrefix + 'Music/juego_coche.mp3';
                bgMusic.play().catch(e => console.log('Bloqueo de audio', e));
            } else {
                bgMusic.pause();
            }
            
            gameOverlay.classList.add("hidden");
            gameRunning = true;
            gameStartTime = Date.now();
            score = 0;
            currentGameState.innerText = isEnLang ? "Playing" : "Jugando";

            if (activeGame === 'chico') {
                canvas.classList.remove("hidden");
                initChicoGame();
            } else if (activeGame === 'chica') {
                canvas.classList.remove("hidden");
                initChicaGame();
            } else if (activeGame === 'maddie') {
                document.getElementById("maddieContainer").classList.remove("hidden");
                maddieGrid.classList.remove("hidden");
                maddieScoreboard.classList.remove("hidden");
                initMaddieGame();
            } else if (activeGame === 'puebla') {
                canvas.classList.remove("hidden");
                initPueblaGame();
            }
        }

        // RECORTE DE RESTART EN CANVASES
        function drawGameOverOverlaySprites() {
            const restartCanvas = document.getElementById("restartSpriteCanvas");
            if (!restartCanvas) return;
            const rCtx = restartCanvas.getContext("2d");
            rCtx.clearRect(0, 0, restartCanvas.width, restartCanvas.height);

            if (sprite.complete && sprite.naturalWidth !== 0) {
                rCtx.drawImage(sprite, 2, 2, 72, 64, 0, 0, 72, 64);
            } else {
                rCtx.fillStyle = "#ffffff";
                rCtx.font = "bold 24px sans-serif";
                rCtx.textAlign = "center";
                rCtx.fillText("🔄", 36, 40);
            }
        }

        function gameOver(finalScore, isVictoryParam = false) {
            if (gameRunning && gameStartTime) {
                const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
                const total = parseInt(localStorage.getItem("bodachicos_time_played") || "0") + elapsed;
                localStorage.setItem("bodachicos_time_played", total);
                gameStartTime = 0;
            }
            gameRunning = false;
            clearInterval(gameInterval);

            if (sfxSpaceEngine) {
                try {
                    sfxSpaceEngine.pause();
                    sfxSpaceEngine.currentTime = 0;
                } catch (e) {}
            }
            if (sfxCarHonk) {
                try {
                    sfxCarHonk.pause();
                    sfxCarHonk.currentTime = 0;
                } catch (e) {}
            }
            
            const isSuccess = activeGame === 'puebla' ? isVictoryParam : (finalScore >= METAS[activeGame]);

            if (activeGame === 'puebla') {
                if (isVictoryParam) {
                    localStorage.setItem("bodachicos_puebla_won", "true");
                }
                const prevMaxDist = parseFloat(localStorage.getItem("bodachicos_maxdist_puebla") || "0");
                if (distanceKm > prevMaxDist) {
                    localStorage.setItem("bodachicos_maxdist_puebla", distanceKm.toFixed(1));
                }
            }
            saveScore(activeGame, finalScore);

            if (isSuccess) {
                playSound('score');
            } else {
                playSound('hit');
                        triggerHaptic([50, 50, 100]);
            }

            if (chicoKeyDownHandler) {
                window.removeEventListener("keydown", chicoKeyDownHandler);
                chicoKeyDownHandler = null;
            }
            if (chicoKeyUpHandler) {
                window.removeEventListener("keyup", chicoKeyUpHandler);
                chicoKeyUpHandler = null;
            }
            if (pueblaKeyDownHandler) {
                window.removeEventListener("keydown", pueblaKeyDownHandler);
                pueblaKeyDownHandler = null;
            }
            if (maddieTimer) {
                clearTimeout(maddieTimer);
                maddieTimer = null;
            }
            
            const meta = METAS[activeGame];
            const coinsEarned = calculateGameChiCoins(activeGame, finalScore);
            
            // Mostrar los contenedores gráficos del Game Over clásico
            document.getElementById("gameOverTitleContainer").classList.remove("hidden");
            
            // Cambiar titulo si ganamos según el juego
            const titleText = document.getElementById("gameOverTitleText");
            if (activeGame === 'puebla' && isSuccess) {
                titleText.innerText = isEnLang ? "YOU ARRIVED!" : "¡LLEGASTE!";
                titleText.className = "text-3xl md:text-4xl font-monogram font-bold tracking-widest text-[#16a34a] animate-pulse";
            } else if (activeGame === 'maddie' && isSuccess) {
                titleText.innerText = isEnLang ? "YOU CAUGHT MADDIE!" : "¡ATRAPASTE A MADDIE!";
                titleText.className = "text-2xl md:text-3xl font-monogram font-bold tracking-widest text-[#f1c40f] animate-pulse";
            } else if (isSuccess) {
                titleText.innerText = isEnLang ? "VICTORY!" : "¡VICTORIA!";
                titleText.className = "text-3xl md:text-4xl font-monogram font-bold tracking-widest text-[#f1c40f] animate-pulse";
            } else {
                titleText.innerText = "GAME OVER";
                titleText.className = "text-3xl md:text-4xl font-monogram font-bold tracking-widest text-[#e74c3c] animate-pulse";
            }
            
            overlayScoreBox.classList.remove("hidden");
            overlayFinalScore.innerText = finalScore.toString().padStart(5, '0');
            const unitLabel = activeGame === 'maddie' ? (isEnLang ? 'clicks' : 'clics') : 'pts';
            overlayMetaCompare.innerText = isEnLang ? `Required target: ${meta} ${unitLabel}` : `Meta requerida: ${meta} ${unitLabel}`;
            
            const coinsEarnedEl = document.getElementById("overlayChiCoinsEarned");
            if (coinsEarnedEl) {
                coinsEarnedEl.innerText = `🪙 +${coinsEarned.toLocaleString()} ChiCoins`;
            }
            
            // Dibujar sobre los lienzos usando sprites.png
            drawGameOverOverlaySprites();

            const startBtn = document.getElementById("startGameBtn");
            startBtn.innerText = isEnLang ? "Play Again" : "Jugar de nuevo";
            startBtn.classList.remove("hidden");
            startBtn.onclick = startActiveGame;
            
            const restartCanvas = document.getElementById("restartSpriteCanvas");
            restartCanvas.classList.remove("hidden");
            restartCanvas.onclick = startActiveGame;
            
            let resultMessage = "";
            if (activeGame === 'puebla') {
                const distDriven = distanceKm.toFixed(1);
                const diffKm = Math.max(0, (120.0 - distanceKm)).toFixed(1);
                if (isSuccess) {
                    resultMessage = isEnLang 
                        ? `🏆 WELCOME TO CHOLULA! You completed the full 120 km, arrived at Cholula, and won +${coinsEarned.toLocaleString()} ChiCoins.`
                        : `🏆 ¡BIENVENIDO A CHOLULA! Condujiste los 120 km completos, llegaste a Cholula y ganaste +${coinsEarned.toLocaleString()} ChiCoins.`;
                    currentGameState.innerText = isEnLang ? "Target achieved!" : "¡Meta lograda!";
                } else {
                    resultMessage = isEnLang 
                        ? `💥 CRASHED BEFORE ARRIVING! You drove ${distDriven} km of 120 km (${diffKm} km left to reach Cholula). Score: ${finalScore} pts. Try again!`
                        : `💥 ¡CHOCASTE ANTES DE LLEGAR! Recorriste ${distDriven} km de 120 km (te faltaron ${diffKm} km para llegar a Cholula). Puntuación: ${finalScore} pts. ¡Inténtalo de nuevo!`;
                    currentGameState.innerText = isEnLang ? "Good try" : "Buen intento";
                }
            } else if (isSuccess) {
                resultMessage = isEnLang ? `🎉 Challenge conquered! You exceeded the target.` : `🎉 ¡Reto superado con éxito! Lograste sobrepasar el objetivo.`;
                currentGameState.innerText = isEnLang ? "Target achieved!" : "¡Meta lograda!";
            } else {
                const diff = meta - finalScore;
                const unitStr = activeGame === 'maddie' ? (isEnLang ? 'clicks' : 'clics') : (isEnLang ? 'points' : 'puntos');
                resultMessage = isEnLang 
                    ? `You were only ${diff} ${unitStr} away from the target. Don't give up!`
                    : `Te quedaste a ${diff} ${unitStr} de alcanzar la meta. ¡No te rindas!`;
                currentGameState.innerText = isEnLang ? "Good try" : "Buen intento";
            }

            overlayInstructions.innerHTML = resultMessage;
            gameOverlay.classList.remove("hidden");
            
            updateScoresDashboard();
        }

        // ==========================================
        let memo, obstacles, items, clouds, bgCacti, chicoFrame, chicoSpeed, groundX, lastScoreMilestone, scorePopups;
        let chicoKeyDownHandler = null;
        let chicoKeyUpHandler = null;
        
        function drawDinoScore(ctx, score, highscore, x, y, textColor = "#535353") {
            ctx.save();
            ctx.font = "24px 'Monogram'";
            ctx.fillStyle = textColor; // Gris del dinosaurio de Chrome / Blanco en Noche
            ctx.textAlign = "right";
            const scoreStr = score.toString().padStart(5, '0');
            const hiStr = highscore.toString().padStart(5, '0');
            ctx.fillText(`HI ${hiStr}  ${scoreStr}`, x, y);
            ctx.restore();
        }

        let maddieUfo = null;
        let marcianoObj = null;
        let leaderWarningTimer = 0;
        let marcianoSpawnedThisRun = false;
        let maddieTouchedThisRun = false;
        let nextObstacleFrame = 0;
        let nextItemFrame = 0;

        function initChicoGame() {
            memo = {
                x: 45,
                y: 303,
                width: 44,
                height: 47,
                vy: 0,
                gravity: 1.6,
                jumpHeight: -17,
                isGrounded: true
            };
            obstacles = [];
            items = [];
            bgCacti = [
                { x: 120, type: 0, scale: 0.45, speedFactor: 0.16 + 0.45 * 0.34 },
                { x: 260, type: 1, scale: 0.80, speedFactor: 0.16 + 0.80 * 0.34 },
                { x: 370, type: 2, scale: 0.58, speedFactor: 0.16 + 0.58 * 0.34 }
            ];
            maddieUfo = null;
            marcianoObj = null;
            leaderWarningTimer = 0;
            marcianoSpawnedThisRun = false;
            maddieTouchedThisRun = false;
            nextObstacleFrame = 48;
            nextItemFrame = 140;
            clouds = [
                {x: 120, y: 60, speed: 0.6},
                {x: 320, y: 90, speed: 0.4}
            ];
            chicoFrame = 0;
            chicoSpeed = 6.0; 
            groundX = 0;
            lastScoreMilestone = 0;
            scorePopups = []; 

            const triggerJump = () => {
                if (memo.isGrounded) {
                    memo.vy = memo.jumpHeight;
                    memo.isGrounded = false;
                    playSound('jump');
            triggerHaptic(20); 
                }
            };

            const endJump = () => {
                if (!memo.isGrounded && memo.vy < -7.5) {
                    memo.vy = -7.5; 
                }
            };

            const checkSkyEasterEggTap = (clientX, clientY) => {
                const rect = canvas.getBoundingClientRect();
                const clickX = (clientX - rect.left) * (canvas.width / rect.width);
                const clickY = (clientY - rect.top) * (canvas.height / rect.height);

                // 1. Tocar al Marciano
                if (marcianoObj && marcianoObj.active && !marcianoObj.intercepted) {
                    const mw = marcianoObj.w || 64;
                    const mh = marcianoObj.h || 38;
                    const mx = marcianoObj.x;
                    const my = marcianoObj.currentY || marcianoObj.y;
                    if (clickX >= mx - mw / 2 - 20 && clickX <= mx + mw / 2 + 20 &&
                        clickY >= my - mh / 2 - 20 && clickY <= my + mh / 2 + 20) {
                        marcianoObj.intercepted = true;
                        playSound('coin');
                        triggerHaptic([40, 30, 80]);
                        scorePopups.push({
                            x: mx,
                            y: my - 10,
                            text: isEnLang ? "MARTIAN INTERCEPTED!" : "¡MARCIANO INTERCEPTADO!",
                            color: "#facc15",
                            life: 45
                        });

                        // Mensaje central: "¡SU LÍDER VIENE POR TI!"
                        leaderWarningTimer = 90; // ~3 segundos a 30 fps

                        // 3 segundos después aparece Maddie en su platillo volador
                        setTimeout(() => {
                            if (gameRunning && activeGame === 'chico') {
                                maddieUfo = {
                                    startTime: Date.now(),
                                    duration: 5000, // 5.0 segundos exactos (duración de spaceEngine_003)
                                    startX: canvas.width + 50,
                                    endX: -70,
                                    y: 44,
                                    w: 58,
                                    h: 48,
                                    active: true
                                };
                                try {
                                    sfxSpaceEngine.currentTime = 0;
                                    sfxSpaceEngine.play().catch(e => console.log('Space engine audio err:', e));
                                } catch (e) {}
                                playSound('bark');
                            }
                        }, 3000);

                        return true;
                    }
                }

                // 2. Tocar a Maddie en su platillo volador
                if (maddieUfo && maddieUfo.active && !maddieTouchedThisRun) {
                    const uw = maddieUfo.w || 58;
                    const uh = maddieUfo.h || 48;
                    const ux = maddieUfo.x || 0;
                    const uy = maddieUfo.y || 44;
                    if (clickX >= ux - uw / 2 - 15 && clickX <= ux + uw / 2 + 15 &&
                        clickY >= uy - uh / 2 - 15 && clickY <= uy + uh / 2 + 15) {
                        maddieTouchedThisRun = true;
                        score += 20;
                        playSound('score');
                        playSound('bark');
                        triggerHaptic([50, 40, 50, 40, 100]);
                        scorePopups.push({
                            x: ux,
                            y: uy + 12,
                            text: isEnLang ? "ALIEN CONTACT! +20" : "¡CONTACTO ALIENÍGENA! +20",
                            color: "#38bdf8",
                            life: 55
                        });
                        return true;
                    }
                }

                return false;
            };

            canvas.onmousedown = (e) => {
                if (checkSkyEasterEggTap(e.clientX, e.clientY)) {
                    return; // Si interactuó con el cielo espacial, no salta
                }
                triggerJump();
            };
            canvas.onmouseup = () => {
                endJump();
            };

            canvas.ontouchstart = (e) => {
                e.preventDefault();
                if (e.touches && e.touches.length > 0) {
                    if (checkSkyEasterEggTap(e.touches[0].clientX, e.touches[0].clientY)) {
                        return;
                    }
                }
                triggerJump();
            };
            canvas.ontouchend = (e) => {
                e.preventDefault();
                endJump();
            };

            chicoKeyDownHandler = (e) => {
                if (e.key === " " || e.code === "Space" || e.key === "ArrowUp") {
                    e.preventDefault(); 
                    triggerJump();
                }
            };
            chicoKeyUpHandler = (e) => {
                if (e.key === " " || e.code === "Space" || e.key === "ArrowUp") {
                    endJump();
                }
            };

            window.addEventListener("keydown", chicoKeyDownHandler);
            window.addEventListener("keyup", chicoKeyUpHandler);

            gameInterval = setInterval(updateChico, 1000 / 30);
        }

        function updateChico() {
            chicoFrame++;
            
            // Incremento acelerado más veloz y nuevo tope de velocidad (15.0)
            if (chicoSpeed < 15.0) {
                chicoSpeed += 0.004; 
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // CONFIGURACIÓN INICIAL DEL FRAME: El T-rex, el fondo y las nubes requieren pixel art (smoothing = false)
            ctx.imageSmoothingEnabled = false;
            ctx.mozImageSmoothingEnabled = false;
            ctx.webkitImageSmoothingEnabled = false;
            ctx.msImageSmoothingEnabled = false;

            // CICLO DÍA / NOCHE PROGRESIVO CHROME DINO (Alterna cada 350 puntos)
            const isNightMode = Math.floor(score / 350) % 2 === 1;
            const skyBgColor = isNightMode ? "#202124" : "#f7f7f7";
            const mainTextColor = isNightMode ? "#e8eaed" : "#535353";

            ctx.fillStyle = skyBgColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // MODO NOCHE: LUNA Y ESTRELLAS EXACTAS DE LA HOJA DE SPRITES DE CHROME (SIN CORTES)
            if (isNightMode) {
                if (sprite.complete && sprite.naturalWidth >= 1000) {
                    // Luna en fase Creciente (x: 1034, y: 2, w: 40, h: 80)
                    ctx.drawImage(sprite, 1034, 2, 40, 80, 290, 35, 20, 40);
                    // Estrellas (x: 1274, y: 2/20/38, w: 18, h: 18)
                    ctx.drawImage(sprite, 1274, 2, 18, 18, 80, 45, 9, 9);
                    ctx.drawImage(sprite, 1274, 20, 18, 18, 180, 70, 9, 9);
                    ctx.drawImage(sprite, 1274, 38, 18, 18, 330, 35, 9, 9);
                } else {
                    ctx.font = "20px sans-serif";
                    ctx.fillText("🌙", 295, 55);
                    ctx.font = "10px sans-serif";
                    ctx.fillText("✨", 80, 40);
                    ctx.fillText("✨", 180, 75);
                    ctx.fillText("✨", 320, 35);
                }

                // SPAWN DEL MARCIANO A LOS 450 PUNTOS
                if (score >= 450 && !marcianoSpawnedThisRun && !marcianoObj) {
                    marcianoSpawnedThisRun = true;
                    marcianoObj = {
                        startTime: Date.now(),
                        duration: 7000, // 7 segundos para cruzar tranquilamente el cielo
                        startX: canvas.width + 40,
                        endX: -60,
                        y: 95, // Más abajo en el cielo para que no quede pegado al HUD superior
                        w: 64,
                        h: 38,
                        active: true,
                        intercepted: false
                    };
                }

                // DIBUJAR AL MARCIANO VOLANDO POR EL CIELO
                if (marcianoObj && marcianoObj.active && !marcianoObj.intercepted) {
                    const elapsed = Date.now() - marcianoObj.startTime;
                    const progress = Math.min(1, elapsed / marcianoObj.duration);
                    marcianoObj.x = marcianoObj.startX + (marcianoObj.endX - marcianoObj.startX) * progress;
                    marcianoObj.currentY = marcianoObj.y + Math.sin(progress * Math.PI * 6) * 4;

                    ctx.save();
                    ctx.imageSmoothingEnabled = true;
                    if (imgMarciano && imgMarciano.complete && imgMarciano.naturalWidth !== 0) {
                        ctx.shadowColor = "rgba(74, 222, 128, 0.75)";
                        ctx.shadowBlur = 8;
                        ctx.drawImage(imgMarciano, Math.round(marcianoObj.x - marcianoObj.w / 2), Math.round(marcianoObj.currentY - marcianoObj.h / 2), marcianoObj.w, marcianoObj.h);
                    } else {
                        ctx.font = "26px sans-serif";
                        ctx.textAlign = "center";
                        ctx.fillText("👽🛸", Math.round(marcianoObj.x), Math.round(marcianoObj.currentY));
                    }
                    ctx.restore();

                    if (progress >= 1) {
                        marcianoObj.active = false;
                    }
                }

                // AVISO EN EL CENTRO DEL CIELO: "SU LÍDER VIENE POR TI"
                if (leaderWarningTimer > 0) {
                    leaderWarningTimer--;
                    const pulse = Math.abs(Math.sin((90 - leaderWarningTimer) * 0.15));
                    ctx.save();
                    ctx.font = "bold 20px 'Monogram'";
                    ctx.fillStyle = `rgba(239, 68, 68, ${0.75 + pulse * 0.25})`;
                    ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
                    ctx.shadowBlur = 6;
                    ctx.textAlign = "center";
                    ctx.fillText(isEnLang ? "THEIR LEADER IS COMING FOR YOU!" : "¡SU LÍDER VIENE POR TI!", canvas.width / 2, 75);
                    ctx.restore();
                }

                // EASTER EGG: MADDIE NAVE ESPACIAL VOLANDO EN LA NOCHE (Sincronizada con spaceEngine_003)
                if (maddieUfo && maddieUfo.active) {
                    const elapsed = Date.now() - maddieUfo.startTime;
                    const progress = Math.min(1, elapsed / maddieUfo.duration);
                    maddieUfo.x = maddieUfo.startX + (maddieUfo.endX - maddieUfo.startX) * progress;
                    maddieUfo.currentY = maddieUfo.y + Math.sin(progress * Math.PI * 8) * 3.5;

                    ctx.save();
                    ctx.imageSmoothingEnabled = true;
                    if (imgMaddieUfo && imgMaddieUfo.complete && imgMaddieUfo.naturalWidth !== 0) {
                        const ufoW = maddieUfo.w || 58;
                        const ufoH = Math.round(ufoW * (imgMaddieUfo.height / imgMaddieUfo.width));
                        maddieUfo.h = ufoH;
                        ctx.shadowColor = "rgba(147, 197, 253, 0.75)";
                        ctx.shadowBlur = 10;
                        ctx.drawImage(imgMaddieUfo, Math.round(maddieUfo.x - ufoW / 2), Math.round(maddieUfo.currentY - ufoH / 2), ufoW, ufoH);
                    } else {
                        ctx.font = "28px sans-serif";
                        ctx.textAlign = "center";
                        ctx.fillText("🛸🐶", Math.round(maddieUfo.x), Math.round(maddieUfo.currentY));
                    }
                    ctx.restore();

                    if (progress >= 1) {
                        maddieUfo = null;
                    }
                }
            }

            // CACTUS DE FONDO EN SEGUNDO PLANO (PARALAJE 2.5D: MÁS GRANDES = MÁS RÁPIDOS Y CERCANOS, MÁS PEQUEÑOS = MÁS LENTOS Y LEJANOS)
            if (bgCacti.length < 6 && Math.random() < 0.035) {
                // Escala entre 0.38 (lejano en el horizonte) y 0.88 (fondo cercano)
                const scale = 0.38 + Math.random() * 0.50;
                // Velocidad proporcional a la escala (entre ~0.29x y ~0.46x de chicoSpeed, siempre en segundo plano respecto al suelo 1.0x)
                const speedFactor = 0.16 + (scale * 0.34);
                // 3 tipos de cactus de la hoja de sprites: 0 = simple pequeño, 1 = doble pequeño, 2 = alto
                const randType = Math.floor(Math.random() * 3);
                bgCacti.push({
                    x: canvas.width + 40,
                    type: randType,
                    scale: scale,
                    speedFactor: speedFactor
                });
            }

            for (let i = bgCacti.length - 1; i >= 0; i--) {
                let bg = bgCacti[i];
                bg.x -= chicoSpeed * bg.speedFactor; 

                if (sprite.complete && sprite.naturalWidth >= 1000) {
                    ctx.save();
                    // Perspectiva atmosférica: los cactus más pequeños/lejanos son más tenues
                    const baseAlpha = isNightMode ? (0.12 + bg.scale * 0.12) : (0.16 + bg.scale * 0.18);
                    ctx.globalAlpha = baseAlpha; 

                    let sx, sy, sw, sh, baseW, baseH;
                    if (bg.type === 0) {
                        sx = 446; sy = 2; sw = 34; sh = 70; baseW = 17; baseH = 35;
                    } else if (bg.type === 1) {
                        sx = 480; sy = 2; sw = 68; sh = 70; baseW = 34; baseH = 35;
                    } else {
                        sx = 652; sy = 2; sw = 50; sh = 100; baseW = 25; baseH = 50;
                    }

                    const drawW = Math.round(baseW * bg.scale);
                    const drawH = Math.round(baseH * bg.scale);
                    const drawY = 351 - drawH; // Base anclada a la línea del horizonte del suelo (y=351)

                    ctx.drawImage(sprite, sx, sy, sw, sh, Math.round(bg.x), drawY, drawW, drawH);
                    ctx.restore();
                }

                if (bg.x < -80) {
                    bgCacti.splice(i, 1);
                }
            }

            if (sprite.complete && sprite.naturalWidth !== 0) {
                for (let cl of clouds) {
                    cl.x -= cl.speed;
                    // Alineación a pixel entero (Math.round) para evitar temblor
                    ctx.drawImage(sprite, 166, 2, 92, 28, Math.round(cl.x), Math.round(cl.y), 46, 14);
                    if (cl.x < -50) cl.x = canvas.width + 20;
                }

                groundX = (groundX + chicoSpeed) % 1200;
                let roundedGroundX = Math.round(groundX);
                ctx.drawImage(sprite, 2 + roundedGroundX, 104, 360, 24, 0, 345, 360, 12);
                if (groundX > 1200 - 360) {
                    let roundedRest = Math.round(360 - (1200 - groundX));
                    ctx.drawImage(sprite, 2, 104, roundedRest, 24, 360 - roundedRest, 345, roundedRest, 12);
                }

                let frameOffset = 1; 
                if (gameRunning) {
                    if (memo.isGrounded) {
                        frameOffset = (Math.floor(chicoFrame / 3) % 2) === 0 ? 2 : 3;
                    } else {
                        frameOffset = 0; 
                    }
                } else {
                    frameOffset = 4; 
                }
                
                ctx.drawImage(
                    sprite, 
                    1678 + (88 * frameOffset), 2, 
                    88, 94, 
                    Math.round(memo.x), Math.round(memo.y), 
                    memo.width, memo.height
                );
            } else {
                ctx.font = "20px sans-serif";
                for (let cl of clouds) {
                    cl.x -= cl.speed;
                    ctx.fillText("☁️", Math.round(cl.x), Math.round(cl.y));
                    if (cl.x < -50) cl.x = canvas.width + 20;
                }

                groundX = (groundX + chicoSpeed) % 360;
                ctx.strokeStyle = "#535353";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(0, 350);
                ctx.lineTo(canvas.width, 350);
                ctx.stroke();

                ctx.font = "32px sans-serif";
                ctx.fillText("🦖", Math.round(memo.x), Math.round(memo.y) + 35);
            }

            memo.vy += memo.gravity;
            memo.y += memo.vy;
            if (memo.y >= 303) {
                memo.y = 303;
                memo.vy = 0;
                memo.isGrounded = true;
            }

            // GENERACIÓN DE OBSTÁCULOS CON ESPACIADO JUSTO, SIN DOBLES Y CON GRAN VARIABILIDAD
            if (chicoFrame >= nextObstacleFrame) {
                // Tipos de obstáculos de oficina
                const obsTypes = [
                    { img: imgCalendar, fallback: "📅" },
                    { img: imgClock, fallback: "⏰" },
                    { img: imgEmail, fallback: "📩" }
                ];

                const randObs = obsTypes[Math.floor(Math.random() * obsTypes.length)];
                obstacles.push({
                    x: canvas.width,
                    y: 313,
                    width: 32,
                    height: 32,
                    img: randObs.img,
                    fallback: randObs.fallback
                });

                // DILEMA TENTADOR: Poner un control poco antes del obstáculo (riesgo vs recompensa)
                // Ocurre de forma semialeatoria si toca generar control
                if (chicoFrame >= nextItemFrame && Math.random() < 0.40) {
                    // Control tentador colocado ~65px antes del obstáculo a baja o media altura
                    items.push({
                        x: canvas.width - 65,
                        y: 270 - Math.floor(Math.random() * 20), // Tentador: cerca del suelo antes del obstáculo
                        width: 32,
                        height: 32,
                        img: imgGamepad,
                        fallback: "🎮"
                    });
                    nextItemFrame = chicoFrame + 180 + Math.floor(Math.random() * 120);
                }

                // RITMO DINÁMICO DE ESPACIADO: ALTERNA ENTRE SALTOS RÁPIDOS CONSECUTIVOS, DISTANCIA MEDIA Y TRAMOS ABIERTOS
                // 100% libre de obstáculos dobles imposibles (garantiza siempre tiempo para aterrizar)
                const rhythmRoll = Math.random();
                let gapFrames;
                if (rhythmRoll < 0.38) {
                    // 1. Rápido / Consecutivo (están juntos: salto ágil y emocionante tras aterrizar, 100% superable)
                    gapFrames = 26 + Math.floor(Math.random() * 8); // 26 a 33 frames (~0.85s a 1.1s)
                } else if (rhythmRoll < 0.75) {
                    // 2. Distancia media normal (ritmo clásico)
                    gapFrames = 36 + Math.floor(Math.random() * 16); // 36 a 51 frames (~1.2s a 1.7s)
                } else {
                    // 3. Tramo abierto / Separados (oportunidad para respirar o coger controles)
                    gapFrames = 58 + Math.floor(Math.random() * 26); // 58 a 83 frames (~1.9s a 2.7s)
                }
                nextObstacleFrame = chicoFrame + gapFrames;
            }

            // GENERACIÓN DE CONTROLES FLOTANTES EN EL AIRE (si no salió en el dilema previo)
            if (chicoFrame >= nextItemFrame) {
                items.push({
                    x: canvas.width,
                    y: 215 + Math.random() * 55,
                    width: 32,
                    height: 32,
                    img: imgGamepad,
                    fallback: "🎮"
                });
                nextItemFrame = chicoFrame + 160 + Math.floor(Math.random() * 100);
            }

            // DIBUJAR Y PROCESAR OBSTÁCULOS (MOVIMIENTO FLUIDO Y SUAVE)
            for (let i = obstacles.length - 1; i >= 0; i--) {
                let obs = obstacles[i];
                obs.x -= chicoSpeed;
                
                const drawX = Math.round(obs.x);
                const drawY = Math.round(obs.y);

                if (obs.img.complete && obs.img.naturalWidth !== 0) {
                    ctx.drawImage(obs.img, drawX, drawY, obs.width, obs.height);
                } else {
                    ctx.font = "30px sans-serif";
                    ctx.textAlign = "left";
                    ctx.fillText(obs.fallback, drawX, drawY + 26);
                }

                // Detección de colisión estrecha y justa (AABB)
                if (obs.x < memo.x + memo.width - 8 &&
                    obs.x + obs.width > memo.x + 8 &&
                    obs.y < memo.y + memo.height - 6 &&
                    obs.y + obs.height > memo.y + 6) {
                    triggerHaptic(200);
                    gameOver(score);
                    return;
                }
                if (obs.x < -50) obstacles.splice(i, 1);
            }

            // DIBUJAR Y PROCESAR CONTROLES RECOLECTABLES
            for (let i = items.length - 1; i >= 0; i--) {
                let it = items[i];
                it.x -= chicoSpeed;
                
                const drawX = Math.round(it.x);
                const drawY = Math.round(it.y);

                if (it.img.complete && it.img.naturalWidth !== 0) {
                    ctx.drawImage(it.img, drawX, drawY, it.width, it.height);
                } else {
                    ctx.font = "26px sans-serif";
                    ctx.textAlign = "left";
                    ctx.fillText(it.fallback, drawX, drawY + 20);
                }

                // Detección de recolección de gamepad estrecha
                if (it.x < memo.x + memo.width - 4 &&
                    it.x + it.width > memo.x + 4 &&
                    it.y < memo.y + memo.height - 4 &&
                    it.y + it.height > memo.y + 4) {
                    score += 15;
                    playSound('coin');
                    triggerHaptic(30);

                    scorePopups.push({
                        x: it.x + it.width / 2,
                        y: it.y,
                        text: "+15",
                        life: 25 
                    });

                    items.splice(i, 1);
                    continue;
                }
                if (it.x < -50) items.splice(i, 1);
            }

            for (let i = scorePopups.length - 1; i >= 0; i--) {
                let p = scorePopups[i];
                p.y -= 1.2; 
                p.life--;

                const alpha = Math.max(0, Math.min(1, p.life / 25));
                ctx.save();
                ctx.font = "20px 'Monogram'";
                if (p.color) {
                    ctx.fillStyle = p.color;
                    ctx.globalAlpha = alpha;
                    ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
                    ctx.shadowBlur = 4;
                } else {
                    ctx.fillStyle = isNightMode ? `rgba(240, 240, 240, ${alpha})` : `rgba(83, 83, 83, ${alpha})`;
                }
                ctx.textAlign = "center";
                ctx.fillText(p.text, Math.round(p.x), Math.round(p.y));
                ctx.restore();

                if (p.life <= 0) {
                    scorePopups.splice(i, 1);
                }
            }

            if (chicoFrame % 5 === 0) {
                score += 1;
            }

            if (score > 0 && score % 100 === 0 && score !== lastScoreMilestone) {
                lastScoreMilestone = score;
                playSound('score');
            }

            drawDinoScore(ctx, score, getScore('chico'), canvas.width - 20, 30, mainTextColor);
            currentGameScore.innerText = score.toString().padStart(5, '0');
        }

        // ==========================================
        // JUEGO 2: LA CHICA (Atrapa el Amor)
        let basketX, fallObjects, lives, chicaFrame;
        const CHICA_LANES = [45, 135, 225, 315]; 

        function drawChurchBackdrop(ctx, w, h) {
            ctx.save();

            const cx = w / 2;
            const groundY = 445;

            ctx.strokeStyle = "rgba(160, 85, 110, 0.55)";
            ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
            ctx.lineWidth = 2.2;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";

            // Cuerpo principal de la parroquia
            ctx.fillRect(cx - 75, groundY - 170, 150, 170);
            ctx.strokeRect(cx - 75, groundY - 170, 150, 170);

            // Puerta con arco elegante de piedra
            ctx.fillStyle = "rgba(180, 100, 125, 0.25)";
            ctx.beginPath();
            ctx.moveTo(cx - 24, groundY);
            ctx.lineTo(cx - 24, groundY - 58);
            ctx.arc(cx, groundY - 58, 24, Math.PI, 0);
            ctx.lineTo(cx + 24, groundY);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Ventana circular central (Rosetón con cristales)
            ctx.fillStyle = "rgba(255, 220, 230, 0.6)";
            ctx.beginPath();
            ctx.arc(cx, groundY - 120, 22, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(cx, groundY - 120, 8, 0, Math.PI * 2);
            ctx.stroke();

            // Detalles radiales del rosetón
            ctx.lineWidth = 1.5;
            for (let a = 0; a < 4; a++) {
                const angle = (a * Math.PI) / 4;
                ctx.beginPath();
                ctx.moveTo(cx + Math.cos(angle) * 8, groundY - 120 + Math.sin(angle) * 8);
                ctx.lineTo(cx + Math.cos(angle) * 22, groundY - 120 + Math.sin(angle) * 22);
                ctx.stroke();
            }
            ctx.lineWidth = 2.2;

            // Frontón triangular (Punta del techo en groundY - 225)
            ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
            ctx.beginPath();
            ctx.moveTo(cx - 80, groundY - 170);
            ctx.lineTo(cx, groundY - 225);
            ctx.lineTo(cx + 80, groundY - 170);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Cúpula central (Ajustada para nacer armónicamente dentro del frontón sin cruces raros)
            ctx.fillStyle = "rgba(240, 210, 220, 0.5)";
            ctx.beginPath();
            ctx.arc(cx, groundY - 175, 40, Math.PI, 0);
            ctx.fill();
            ctx.stroke();

            // Cruz central sobre el frontón
            ctx.beginPath();
            ctx.moveTo(cx, groundY - 225);
            ctx.lineTo(cx, groundY - 250);
            ctx.moveTo(cx - 8, groundY - 240);
            ctx.lineTo(cx + 8, groundY - 240);
            ctx.stroke();

            // Campanario Izquierdo
            ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
            ctx.fillRect(cx - 125, groundY - 215, 42, 215);
            ctx.strokeRect(cx - 125, groundY - 215, 42, 215);
            ctx.fillStyle = "rgba(180, 100, 125, 0.2)";
            ctx.fillRect(cx - 115, groundY - 190, 22, 40);
            ctx.strokeRect(cx - 115, groundY - 190, 22, 40);
            // Campana izquierda
            ctx.fillStyle = "#d4af37";
            ctx.beginPath();
            ctx.arc(cx - 104, groundY - 172, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            // Techo torre izquierda
            ctx.fillStyle = "rgba(240, 210, 220, 0.6)";
            ctx.beginPath();
            ctx.moveTo(cx - 130, groundY - 215);
            ctx.lineTo(cx - 104, groundY - 262);
            ctx.lineTo(cx - 78, groundY - 215);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            // Cruz izquierda
            ctx.beginPath();
            ctx.moveTo(cx - 104, groundY - 262);
            ctx.lineTo(cx - 104, groundY - 278);
            ctx.moveTo(cx - 110, groundY - 271);
            ctx.lineTo(cx - 98, groundY - 271);
            ctx.stroke();

            // Campanario Derecho
            ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
            ctx.fillRect(cx + 83, groundY - 215, 42, 215);
            ctx.strokeRect(cx + 83, groundY - 215, 42, 215);
            ctx.fillStyle = "rgba(180, 100, 125, 0.2)";
            ctx.fillRect(cx + 93, groundY - 190, 22, 40);
            ctx.strokeRect(cx + 93, groundY - 190, 22, 40);
            // Campana derecha
            ctx.fillStyle = "#d4af37";
            ctx.beginPath();
            ctx.arc(cx + 104, groundY - 172, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            // Techo torre derecha
            ctx.fillStyle = "rgba(240, 210, 220, 0.6)";
            ctx.beginPath();
            ctx.moveTo(cx + 78, groundY - 215);
            ctx.lineTo(cx + 104, groundY - 262);
            ctx.lineTo(cx + 130, groundY - 215);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            // Cruz derecha
            ctx.beginPath();
            ctx.moveTo(cx + 104, groundY - 262);
            ctx.lineTo(cx + 104, groundY - 278);
            ctx.moveTo(cx + 98, groundY - 271);
            ctx.lineTo(cx + 110, groundY - 271);
            ctx.stroke();

            ctx.restore();
        }

        let ringStreak = 0;
        let magnetTimer = 0;

        function initChicaGame() {
            basketX = canvas.width / 2 - 25;
            fallObjects = [];
            chicaPopups = [];
            lives = 3;
            chicaFrame = 0;
            ringStreak = 0;
            magnetTimer = 0;

            // Desactivar cualquier listener de clic o salto previo para que el mouse no haga sonido al hacer clic
            canvas.onclick = null;
            canvas.ontouchstart = null;

            const moveBasket = (clientX) => {
                const rect = canvas.getBoundingClientRect();
                const relativeX = (clientX - rect.left) * (canvas.width / rect.width);
                basketX = Math.max(0, Math.min(canvas.width - 50, relativeX - 25));
            };

            canvas.onmousemove = (e) => moveBasket(e.clientX);
            canvas.ontouchmove = (e) => {
                e.preventDefault();
                moveBasket(e.touches[0].clientX);
            };

            gameInterval = setInterval(updateChica, 1000 / 30);
        }

        function updateChica() {
            chicaFrame++;
            ctx.imageSmoothingEnabled = true;
            ctx.mozImageSmoothingEnabled = true;
            ctx.webkitImageSmoothingEnabled = true;
            ctx.msImageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 1. FONDO LIMPIO ROSA NUPCIAL SIN GRANULADO
            const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
            bgGrad.addColorStop(0, "#fdeeed"); // Crema rosado suave
            bgGrad.addColorStop(0.55, "#fce4ec"); // Rosa pastel limpio
            bgGrad.addColorStop(1, "#f8bbd0"); // Tono romántico cálido
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 2. DIBUJO ILUSTRATIVO DE LA PARROQUIA DE FONDO
            drawChurchBackdrop(ctx, canvas.width, canvas.height);

            // Suelo / Base limpia
            ctx.fillStyle = "#f48fb1";
            ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
            ctx.strokeStyle = "#ad1457";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, canvas.height - 20);
            ctx.lineTo(canvas.width, canvas.height - 20);
            ctx.stroke();

            // 3. GENERAR ÍTEMS QUE CAEN (Corazón 💖, Anillo 💍, Tormenta 🌩️)
            if (chicaFrame % 24 === 0) {
                const laneIdx = Math.floor(Math.random() * 4);
                const spawnX = CHICA_LANES[laneIdx];
                const randType = Math.random();
                let typeEmoji = "💖";
                let isDanger = false;
                let pts = 1;

                if (randType > 0.7) {
                    typeEmoji = "🌩️"; 
                    isDanger = true;
                } else if (randType > 0.4) {
                    typeEmoji = "💍";
                    pts = 2;
                }

                fallObjects.push({
                    x: spawnX + (Math.random() * 12 - 6), 
                    y: -30,
                    emoji: typeEmoji,
                    isDanger: isDanger,
                    pts: pts,
                    speed: 4.5 + Math.random() * 3.5
                });
            }

            // 4. DIBUJAR A LA NOVIA (SPRITE EMOJI CHICA O CON LENTES SI EASTER EGG ACTIVO, NÍTIDO Y SIN GRANULADO)
            const spriteChica = (magnetTimer > 0 && imgChicaLentesGame.complete && imgChicaLentesGame.naturalWidth > 0)
                ? imgChicaLentesGame
                : ((imgChicaGame.complete && imgChicaGame.naturalWidth > 0) ? imgChicaGame : null);

            const brideDrawW = 56;
            const brideDrawH = 56;
            const brideDrawX = Math.round(basketX + 25 - brideDrawW / 2);
            const brideDrawY = 404;

            // Sombra suave en el suelo para anclar la figura limpiamente
            ctx.save();
            ctx.fillStyle = "rgba(173, 20, 87, 0.22)";
            ctx.beginPath();
            ctx.ellipse(Math.round(basketX + 25), 458, 18, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            ctx.save();
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.shadowColor = "rgba(0, 0, 0, 0.20)";
            ctx.shadowBlur = 4;
            ctx.shadowOffsetY = 2;

            if (spriteChica) {
                ctx.drawImage(spriteChica, brideDrawX, brideDrawY, brideDrawW, brideDrawH);
            } else {
                ctx.font = "48px sans-serif";
                ctx.textAlign = "center";
                ctx.fillText(magnetTimer > 0 ? "😎" : "👰🏻‍♀️", Math.round(basketX + 25), 450);
            }
            ctx.restore();

            // EASTER EGG: MODO IMÁN DE AMOR (Mariana con gafas y aura magnética rosa)
            if (magnetTimer > 0) {
                magnetTimer--;
                ctx.save();
                ctx.strokeStyle = "rgba(236, 72, 153, 0.75)";
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(basketX + 25, 432, 38 + (magnetTimer % 8) * 2, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();

                // Atraer automáticamente corazones y anillos
                fallObjects.forEach(o => {
                    if (!o.isDanger) {
                        o.x += (basketX + 25 - o.x) * 0.22;
                    }
                });
            }

            // 5. VIDAS EN PANTALLA
            let heartUI = "";
            for (let h = 0; h < 3; h++) {
                heartUI += h < lives ? "💖 " : "🤍 ";
            }
            ctx.font = "18px sans-serif";
            ctx.textAlign = "left";
            ctx.fillText(heartUI, 16, 32);

            // 6. ANIMAR Y DIBUJAR ÍTEMS (TOTALMENTE NÍTIOS Y OPACOS)
            for (let i = fallObjects.length - 1; i >= 0; i--) {
                let obj = fallObjects[i];
                obj.y += obj.speed;
                
                ctx.save();
                ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
                ctx.shadowBlur = 4;
                ctx.shadowOffsetY = 2;
                ctx.font = "36px sans-serif";
                ctx.textAlign = "center";
                ctx.fillText(obj.emoji, Math.round(obj.x), Math.round(obj.y));
                ctx.restore();

                // DETECCIÓN DE COLISIÓN
                if (obj.y >= 405 && obj.y <= 460 && obj.x >= basketX - 12 && obj.x <= basketX + 62) {
                    if (obj.isDanger) {
                        lives--;
                        ringStreak = 0;
                        playSound('hit');
                        triggerHaptic([50, 50, 100]);
                        chicaPopups.push({ x: obj.x, y: 405, text: "❤️ -1", color: "#ef4444", life: 30 });
                    } else {
                        score += obj.pts;
                        playSound('coin');
                        triggerHaptic(30); 
                        chicaPopups.push({ x: obj.x, y: 405, text: "+" + obj.pts, color: "#10b981", life: 30 });

                        // EASTER EGG: 3 ANILLOS SEGUIDOS ACTIVAN EL IMÁN DE AMOR
                        if (obj.emoji === "💍") {
                            ringStreak++;
                            if (ringStreak >= 3 && magnetTimer <= 0) {
                                magnetTimer = 150; // 5 segundos a 30fps (+1 segundo extra de duración)
                                ringStreak = 0;
                                playSound('coin');
                                chicaPopups.push({ x: basketX + 25, y: 380, text: "💖 ¡IMÁN DE AMOR! 🧲", color: "#ec4899", life: 45 });
                            }
                        } else if (obj.emoji === "💖") {
                            ringStreak = 0;
                        }
                    }
                    fallObjects.splice(i, 1);

                    if (lives <= 0) {
                        triggerHaptic(200);
                    gameOver(score);
                        return;
                    }
                    continue;
                }

                if (obj.y > canvas.height + 20) {
                    if (!obj.isDanger) {
                        lives--;
                        ringStreak = 0;
                        playSound('hit');
                        triggerHaptic([50, 50, 100]);
                    }
                    fallObjects.splice(i, 1);

                    if (lives <= 0) {
                        triggerHaptic(200);
                    gameOver(score);
                        return;
                    }
                }
            }

            // Dibujar Popups
            for (let i = chicaPopups.length - 1; i >= 0; i--) {
                let p = chicaPopups[i];
                p.y -= 1.5;
                p.life--;
                ctx.save();
                ctx.font = "bold 24px 'Monogram', monospace";
                ctx.fillStyle = p.color;
                ctx.globalAlpha = Math.max(0, p.life / 30);
                ctx.textAlign = "center";
                ctx.shadowColor = "rgba(0,0,0,0.8)";
                ctx.shadowBlur = 3;
                ctx.fillText(p.text, Math.round(p.x), Math.round(p.y));
                ctx.restore();
                if (p.life <= 0) chicaPopups.splice(i, 1);
            }

            drawRetroScore(ctx, score, canvas.width - 20, 20);
            currentGameScore.innerText = score.toString().padStart(5, '0');
        }

        // ==========================================
        // JUEGO 3: MADDIE (¡Atrapa a la perrita! Obstáculo: Popós 💩)
        let maddieTimer, activeHole, activeDistractorHole, lastActiveHole, timeRemaining;
        let activeGoldenHole = -1, goldenItemType = "🦴";
        let lastPoopTapHole = -1, lastPoopTapTime = 0, poopPenaltyTimeout = null;
        
        function initMaddieGame() {
            maddieGrid.innerHTML = "";
            timeRemaining = 30;
            currentGameState.innerText = "Tiempo: 30s";
            lastActiveHole = -1;
            activeDistractorHole = -1;
            activeGoldenHole = -1;
            lastPoopTapHole = -1;
            lastPoopTapTime = 0;
            if (poopPenaltyTimeout) clearTimeout(poopPenaltyTimeout);
            
            updateMaddieRetroScore();

            for (let i = 0; i < 16; i++) {
                const hole = document.createElement("button");
                // Usamos la nueva clase de hoyo de tierra de alta calidad
                hole.className = "maddie-hole";
                hole.id = "hole-" + i;
                // onpointerdown para respuesta instantánea (0ms) en móviles y PC sin retrasos de click
                hole.onpointerdown = (e) => {
                    e.preventDefault();
                    handleHoleClick(i);
                };
                maddieGrid.appendChild(hole);
            }

            const timeDisplay = document.getElementById("maddieTimeDisplay");
            if (timeDisplay) timeDisplay.innerText = "30";

            gameInterval = setInterval(() => {
                timeRemaining--;
                currentGameState.innerText = `Tiempo: ${timeRemaining}s`;
                if (timeDisplay) timeDisplay.innerText = timeRemaining.toString().padStart(2, '0');
                if (timeRemaining <= 0) {
                    triggerHaptic(200);
                    gameOver(score);
                }
            }, 1000);

            maddiePop();
        }

        function updateMaddieRetroScore() {
            const curStr = score.toString().padStart(5, '0');
            const hiStr = getScore('maddie').toString().padStart(5, '0');
            document.getElementById("maddieCurrentScore").innerText = curStr;
            document.getElementById("maddieHighScore").innerText = hiStr;
        }

        function maddiePop() {
            if (!gameRunning) return;
            
            if (activeHole !== undefined && activeHole !== -1) {
                const prev = document.getElementById("hole-" + activeHole);
                if (prev) prev.innerHTML = "";
            }
            if (activeDistractorHole !== undefined && activeDistractorHole !== -1) {
                const prevDist = document.getElementById("hole-" + activeDistractorHole);
                if (prevDist) prevDist.innerHTML = "";
            }
            if (activeGoldenHole !== undefined && activeGoldenHole !== -1) {
                const prevGold = document.getElementById("hole-" + activeGoldenHole);
                if (prevGold) prevGold.innerHTML = "";
            }

            activeHole = -1;
            activeDistractorHole = -1;
            activeGoldenHole = -1;
            lastPoopTapHole = -1;

            const isDecoyOnly = Math.random() < 0.25; // 25% de las veces sale ÚNICAMENTE una popó para destantear al jugador

            if (isDecoyOnly) {
                let distHole;
                do {
                    distHole = Math.floor(Math.random() * 16);
                } while (distHole === lastActiveHole);
                
                activeDistractorHole = distHole;
                lastActiveHole = activeDistractorHole;
                const distEl = document.getElementById("hole-" + activeDistractorHole);
                if (distEl) {
                    distEl.innerHTML = "<span class='select-none pointer-events-none text-4xl animate-pop-up inline-block'>💩</span>";
                }
            } else {
                let nextHole;
                do {
                    nextHole = Math.floor(Math.random() * 16);
                } while (nextHole === lastActiveHole);
                
                lastActiveHole = nextHole;

                // EASTER EGG: 5% de probabilidad de Hueso (Solo Hueso 🦴, sin estrellas, sin pizza)
                const isGoldenChance = Math.random() < 0.05;
                if (isGoldenChance) {
                    activeGoldenHole = nextHole;
                    goldenItemType = "🦴";
                    const next = document.getElementById("hole-" + nextHole);
                    if (next) {
                        next.innerHTML = `<span class='select-none pointer-events-none text-4xl md:text-5xl animate-bounce inline-block'>${goldenItemType}</span>`;
                    }
                } else {
                    activeHole = nextHole;
                    const next = document.getElementById("hole-" + activeHole);
                    if (next) {
                        next.innerHTML = `<img src="${assetPrefix}SpritesNecesarios/maddie_juego.png" class="select-none pointer-events-none w-[88%] h-[88%] object-contain animate-pop-up inline-block drop-shadow-md" alt="Maddie">`;
                    }
                }

                // 25% Probabilidad de distractor popó en otro hoyo simultáneo
                if (Math.random() < 0.25) {
                    let distHole;
                    do {
                        distHole = Math.floor(Math.random() * 16);
                    } while (distHole === nextHole);
                    
                    activeDistractorHole = distHole;
                    const distEl = document.getElementById("hole-" + activeDistractorHole);
                    if (distEl) {
                        distEl.innerHTML = "<span class='select-none pointer-events-none text-4xl animate-pop-up inline-block'>💩</span>";
                    }
                }
            }

            // Dificultad balanceada y accesible vinculada a la puntuación
            let popDelay = Math.max(550, 1100 - (score * 18));
            // Si salió el hueso, dura mucho menos tiempo en pantalla (¡más difícil y rápido!)
            if (activeGoldenHole !== -1) {
                popDelay = Math.max(300, Math.floor(popDelay * 0.45));
            }
            maddieTimer = setTimeout(maddiePop, popDelay);
        }

        function handleHoleClick(index) {
            if (!gameRunning) return;

            // EASTER EGG 1: HUESO (+5 PTS)
            if (index === activeGoldenHole) {
                score += 5;
                playSound('bark');
                playSound('coin');
                triggerHaptic([30, 30, 60]);
                document.getElementById("currentGameScore").innerText = score.toString().padStart(5, '0');
                updateMaddieRetroScore();

                const hitHole = document.getElementById("hole-" + index);
                if (hitHole) {
                    hitHole.innerHTML = "<span class='text-xs font-bold text-amber-500 animate-pop-up inline-block'>+5 HUESO!</span>";
                    setTimeout(() => { if (hitHole) hitHole.innerHTML = ""; }, 400);
                }
                activeGoldenHole = -1;
                clearTimeout(maddieTimer);
                maddiePop();
                return;
            }

            if (index === activeHole) {
                // ACIERTO: Captura a Maddie con ladrido tierno
                score++;
                playSound('bark');
                triggerHaptic(40); 
                
                document.getElementById("currentGameScore").innerText = score.toString().padStart(5, '0');
                updateMaddieRetroScore();
                
                const hitHole = document.getElementById("hole-" + index);
                if (hitHole) hitHole.innerHTML = "";
                activeHole = -1;

                clearTimeout(maddieTimer);
                maddiePop();
                return;
            }

            if (index === activeDistractorHole) {
                const now = Date.now();
                const distHole = document.getElementById("hole-" + index);

                // Si ya se había tocado este mismo hoyo y el segundo toque es muy rápido (< 220ms):
                if (lastPoopTapHole === index && (now - lastPoopTapTime < 220)) {
                    // ¡Doble toque súper rápido exitoso! Se cancela el castigo y aparece la escoba mágica
                    clearTimeout(poopPenaltyTimeout);
                    clearTimeout(maddieTimer);
                    lastPoopTapHole = -1;
                    activeDistractorHole = -1;
                    playSound('coin');
                    triggerHaptic(40);
                    if (distHole) {
                        distHole.innerHTML = "<span class='text-3xl inline-block animate-pop-up'>🧹✨</span>";
                        setTimeout(() => { 
                            if (distHole) distHole.innerHTML = ""; 
                            maddiePop();
                        }, 320);
                    } else {
                        maddiePop();
                    }
                    return;
                }

                // Primer toque a la popó:
                // Pausamos el timer de maddiePop para que la popó NO desaparezca súbitamente bajo el dedo
                clearTimeout(maddieTimer);
                lastPoopTapHole = index;
                lastPoopTapTime = now;
                if (distHole) {
                    distHole.innerHTML = "<span class='select-none pointer-events-none text-4xl animate-bounce inline-block'>💩</span>";
                }

                // Ventana ultrarrápida de 220ms para el segundo toque; si no ocurre, se aplica el castigo inmediatamente
                clearTimeout(poopPenaltyTimeout);
                poopPenaltyTimeout = setTimeout(() => {
                    if (!gameRunning) return;
                    score = Math.max(0, score - 2);
                    playSound('hit');
                    triggerHaptic([50, 50, 100]);
                    document.getElementById("currentGameScore").innerText = score.toString().padStart(5, '0');
                    updateMaddieRetroScore();
                    if (distHole) distHole.innerHTML = "";
                    activeDistractorHole = -1;
                    lastPoopTapHole = -1;
                    maddiePop();
                }, 220);
            }
        }

        // ==========================================
        // JUEGO 4: CAMINO A PUEBLA (OutRun 3D Retro con Casetas, Curvas y Letreros SCT)
        let playerX, targetLane, roadObjects, sceneryObjects, roadFrame, roadSpeed;
        let distanceKm = 0, bonusScore = 0;
        let currentRoadCurve = 0, targetRoadCurve = 0;
        let rioFrioSpawned = false, sanMartinSpawned = false, cholulaSpawned = false, tollGates = [];
        let pueblaKeyDownHandler = null;
        let recentSignTexts = [];
        let pueblaHornUsed = false;
        let pueblaHornBannerTimer = 0;
        let lastCarTapTime = 0;

        function triggerPueblaHorn() {
            if (!gameRunning || pueblaHornUsed) return;
            pueblaHornUsed = true;
            pueblaHornBannerTimer = 90; // ~3 seg a 30 fps
            playSound('wedding_horn');
            triggerHaptic([60, 40, 60, 40, 90]);

            // Obtener todos los coches visibles en pantalla frente a nosotros
            const aheadCars = roadObjects.filter(o => (o.isCar || o.trafficImg) && o.y < 440 && !o.isPulledAside);

            aheadCars.forEach((car, idx) => {
                car.isPulledAside = true;
                car.isCar = false; // Se desactiva la colisión de inmediato para seguridad del jugador

                if (targetLane === 1) {
                    // Si estamos en medio, SOLO se mueven los que estén en medio
                    if (car.lane >= 0.7 && car.lane <= 1.3) {
                        // Se alternan hacia izquierda (0) o derecha (2)
                        car.destLane = (idx % 2 === 0) ? 0 : 2;
                    } else {
                        // Los que ya están en carril 0 o 2 no necesitan moverse
                        car.destLane = Math.round(car.lane);
                    }
                } else if (targetLane === 0) {
                    // Estamos a la izquierda: todos los coches se alejan moviéndose hacia la derecha
                    if (car.lane <= 0.6) {
                        car.destLane = 1;
                    } else if (car.lane <= 1.5) {
                        car.destLane = 2;
                    } else {
                        car.destLane = 2;
                    }
                } else if (targetLane === 2) {
                    // Estamos a la derecha: todos los coches se alejan moviéndose hacia la izquierda
                    if (car.lane >= 1.4) {
                        car.destLane = 1;
                    } else if (car.lane >= 0.5) {
                        car.destLane = 0;
                    } else {
                        car.destLane = 0;
                    }
                }
            });
        }

        const PUEBLA_SIGNS = [
            { text: "CHOLULA", arrow: "↑", dist: "15 km" },
            { text: "VAL'QUIRICO", arrow: "➔", dist: "8 km" },
            { text: "SAN MARTÍN", arrow: "↑", dist: "10 km" },
            { text: "PUEBLA CENTRO", arrow: "↑", dist: "22 km" },
            { text: "MOLE POBLANO", arrow: "➔", dist: "1 km" },
            { text: "CHALUPAS", arrow: "➔", dist: "500 m" },
            { text: "CEMITAS", arrow: "➔", dist: "300 m" },
            { text: "ATLIXCO", arrow: "↑", dist: "30 km" },
            { text: "ZONA CURVAS", arrow: "⬿", dist: "RÍO FRÍO" },
            { text: "CATEDRAL", arrow: "➔", dist: "20 km" },
            { text: "FUERTES LORETO", arrow: "➔", dist: "18 km" },
            { text: "AFRICAM SAFARI", arrow: "➔", dist: "25 km" },
            { text: "TELÉFERICO", arrow: "➔", dist: "16 km" }
        ];
        
        function getPueblaRoadCenter(y) {
            const horizonY = 180;
            const roadHeight = canvas.height - horizonY;
            const depthPct = Math.max(0, Math.min(1, (y - horizonY) / roadHeight));
            return 180 + currentRoadCurve * Math.pow(depthPct, 1.8);
        }

        function getPueblaLaneX(lane, y) {
            const horizonY = 180;
            const roadHeight = canvas.height - horizonY;
            const depthPct = Math.max(0, Math.min(1, (y - horizonY) / roadHeight));
            const currentRoadWidth = 40 + depthPct * 260;
            const center = getPueblaRoadCenter(y);
            return center - currentRoadWidth / 2 + (lane * currentRoadWidth) / 3 + currentRoadWidth / 6;
        }

        let lastSpawnedCars = [];
        
        function initPueblaGame() {
            playerX = 180; 
            targetLane = 1; 
            roadObjects = [];
            lastSpawnedCars = [];
            sceneryObjects = [];
            tollGates = [];
            recentSignTexts = [];
            distanceKm = 0;
            bonusScore = 0;
            currentRoadCurve = 0;
            targetRoadCurve = 0;
            rioFrioSpawned = false;
            sanMartinSpawned = false;
            cholulaSpawned = false;
            pueblaHornUsed = false;
            pueblaHornBannerTimer = 0;
            lastCarTapTime = 0;
            roadFrame = 0;
            roadSpeed = 8.5;
            currentGameState.innerText = "Manejando";

            const changeLane = (dir) => {
                if (!gameRunning) return;
                if (dir < 0 && targetLane > 0) {
                    targetLane--;
                    playSound('car_rev');
                } else if (dir > 0 && targetLane < 2) {
                    targetLane++;
                    playSound('car_rev');
                }
            };

            let touchStartX = 0;
            let touchStartY = 0;

            // En PC: los clics no cambian de carril (solo flechas/A-D); doble clic en el coche activa el claxon
            canvas.onclick = (e) => {
                const rect = canvas.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const clickY = e.clientY - rect.top;

                const now = Date.now();
                const isNearCar = Math.abs(clickX - playerX) < 65 && Math.abs(clickY - 440) < 65;
                if (isNearCar && (now - lastCarTapTime < 450)) {
                    triggerPueblaHorn();
                    lastCarTapTime = 0;
                    return;
                }
                if (isNearCar) {
                    lastCarTapTime = now;
                }
            };

            canvas.ondblclick = () => {
                triggerPueblaHorn();
            };

            canvas.ontouchstart = (e) => {
                if (e.touches && e.touches.length > 0) {
                    touchStartX = e.touches[0].clientX;
                    touchStartY = e.touches[0].clientY;
                }
            };

            // En móvil: el auto SOLO cambia de carril mediante swipe horizontal (no por toques en la pantalla)
            canvas.ontouchend = (e) => {
                if (!e.changedTouches || e.changedTouches.length === 0) return;
                const touchEndX = e.changedTouches[0].clientX;
                const touchEndY = e.changedTouches[0].clientY;
                const diffX = touchEndX - touchStartX;
                const diffY = touchEndY - touchStartY;

                // Swipe horizontal consistente estilo Subway Surfers
                if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 22) {
                    if (diffX > 0) {
                        changeLane(1);
                    } else {
                        changeLane(-1);
                    }
                } else if (Math.abs(diffX) < 18 && Math.abs(diffY) < 18) {
                    // Tap suave: NO cambia de carril. Si es doble tap sobre el auto, activa el claxon sin mover el coche
                    const rect = canvas.getBoundingClientRect();
                    const clickX = touchEndX - rect.left;
                    const clickY = touchEndY - rect.top;

                    const now = Date.now();
                    const isNearCar = Math.abs(clickX - playerX) < 70 && Math.abs(clickY - 440) < 70;
                    if (isNearCar && (now - lastCarTapTime < 450)) {
                        triggerPueblaHorn();
                        lastCarTapTime = 0;
                        return;
                    }
                    if (isNearCar) {
                        lastCarTapTime = now;
                    }
                }
            };

            pueblaKeyDownHandler = (e) => {
                if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
                    changeLane(-1);
                } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
                    changeLane(1);
                } else if (e.key === " " || e.key === "h" || e.key === "H") {
                    triggerPueblaHorn();
                }
            };
            window.addEventListener("keydown", pueblaKeyDownHandler);

            gameInterval = setInterval(updatePuebla, 1000 / 30);
        }

        // DIBUJO DEL AUTO DEPORTIVO RETRO VISTO DESDE ATRÁS (OUTRUN REAR-VIEW CAR)
        function drawRearViewCar(ctx, x, y, width, height) {
            ctx.save();
            
            // Sombra en el asfalto
            ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
            ctx.beginPath();
            ctx.ellipse(x, y + height / 2 - 1, width / 2 + 4, 6, 0, 0, Math.PI * 2);
            ctx.fill();

            if (imgTrafficCar4.complete && imgTrafficCar4.naturalWidth !== 0) {
                // Nuestro coche es el coche gris de coches_cuatro de la segunda columna, tercer fila
                // (4 cols, 3 rows) -> c = 1, r = 2
                const cropped = getTightlyCroppedSprite(imgTrafficCar4, 4, 3, 1, 2);
                if (cropped) {
                    ctx.imageSmoothingEnabled = true;
                    // Mapear la orilla correctamente al ancho del hitbox (width), ajustando la altura proporcional
                    const carH = Math.round(width * (cropped.height / cropped.width));
                    ctx.drawImage(cropped, Math.round(x - width / 2), Math.round(y - carH / 2 - 2), width, carH);
                } else {
                    ctx.fillStyle = "#616161";
                    ctx.fillRect(Math.round(x - width / 2), Math.round(y - height / 2), width, height);
                }
            } else {
                // Dibujo procedural fallback
                ctx.fillStyle = "#616161";
                ctx.fillRect(Math.round(x - width / 2), Math.round(y - height / 2), width, height);
            }

            ctx.restore();
        }

        function updatePuebla() {
            initTrafficDefs();
            roadFrame++;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const horizonY = 180;
            const roadHeight = canvas.height - horizonY;

            // 1. CIELO RETRO CON DEGRADADO
            const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
            skyGrad.addColorStop(0, "#1a5276");
            skyGrad.addColorStop(0.65, "#2980b9");
            skyGrad.addColorStop(1, "#85c1e9");
            ctx.fillStyle = skyGrad;
            ctx.fillRect(0, 0, canvas.width, horizonY);

            // SOL / RESPLANDOR (Ubicar a la izquierda para que nunca sea tapado por los volcanes)
            ctx.fillStyle = "rgba(255, 241, 118, 0.4)";
            ctx.beginPath();
            ctx.arc(75, 55, 28, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#fff9c4";
            ctx.beginPath();
            ctx.arc(75, 55, 18, 0, Math.PI * 2);
            ctx.fill();

            // 1.5. VOLCANES POPOCATÉPETL E IZTACCÍHUATL (SE APROXIMAN Y QUEDAN ATRÁS A LOS KM 70)
            if (distanceKm < 70.0) {
                ctx.save();
                let volScale = 1.0;
                let volYOffset = 0;
                let volSpread = 0;

                if (distanceKm < 45.0) {
                    volScale = 1.0 + (distanceKm / 45.0) * 1.5;
                } else {
                    const passPct = (distanceKm - 45.0) / 25.0; // 0.0 a 1.0 (rebasados por completo al km 70)
                    volScale = 2.5 + passPct * 0.9;
                    volYOffset = passPct * 170; // Se desplazan hacia abajo fuera de la pantalla
                    volSpread = passPct * 120;  // Se abren hacia los lados al rebasarlos
                }

                const volBaseY = horizonY + volYOffset;

                // IZTACCÍHUATL (La Mujer Dormida - silueta izquierda)
                const iztaX = 140 - volSpread;
                ctx.fillStyle = "#2c3e50";
                ctx.beginPath();
                ctx.moveTo(iztaX - 110 * volScale, volBaseY);
                ctx.lineTo(iztaX - 60 * volScale, volBaseY - 38 * volScale);
                ctx.lineTo(iztaX - 15 * volScale, volBaseY - 52 * volScale);
                ctx.lineTo(iztaX + 25 * volScale, volBaseY - 60 * volScale);
                ctx.lineTo(iztaX + 65 * volScale, volBaseY - 42 * volScale);
                ctx.lineTo(iztaX + 95 * volScale, volBaseY - 48 * volScale);
                ctx.lineTo(iztaX + 130 * volScale, volBaseY);
                ctx.closePath();
                ctx.fill();

                // Nieve en Iztaccíhuatl
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.moveTo(iztaX - 25 * volScale, volBaseY - 50 * volScale);
                ctx.lineTo(iztaX + 25 * volScale, volBaseY - 60 * volScale);
                ctx.lineTo(iztaX + 60 * volScale, volBaseY - 44 * volScale);
                ctx.lineTo(iztaX + 90 * volScale, volBaseY - 48 * volScale);
                ctx.lineTo(iztaX + 40 * volScale, volBaseY - 35 * volScale);
                ctx.closePath();
                ctx.fill();

                // POPOCATÉPETL (El Volcán Don Goyo - silueta derecha)
                const popoX = 275 + volSpread;
                ctx.fillStyle = "#1e272e";
                ctx.beginPath();
                ctx.moveTo(popoX - 85 * volScale, volBaseY);
                ctx.lineTo(popoX - 15 * volScale, volBaseY - 78 * volScale);
                ctx.lineTo(popoX + 15 * volScale, volBaseY - 78 * volScale);
                ctx.lineTo(popoX + 95 * volScale, volBaseY);
                ctx.closePath();
                ctx.fill();

                // Nieve en el cráter de Popocatépetl
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.moveTo(popoX - 25 * volScale, volBaseY - 65 * volScale);
                ctx.lineTo(popoX - 15 * volScale, volBaseY - 78 * volScale);
                ctx.lineTo(popoX + 15 * volScale, volBaseY - 78 * volScale);
                ctx.lineTo(popoX + 25 * volScale, volBaseY - 65 * volScale);
                ctx.closePath();
                ctx.fill();

                // Fumarola sutil de vapor del Popocatépetl
                if (roadFrame % 10 < 6) {
                    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
                    ctx.beginPath();
                    ctx.arc(popoX, volBaseY - 88 * volScale, 6 * volScale, 0, Math.PI * 2);
                    ctx.arc(popoX + 5 * volScale, volBaseY - 98 * volScale, 10 * volScale, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.restore();
            }

            // 1.6. LA GRAN PIRÁMIDE DE CHOLULA Y EL SANTUARIO EN LA CIMA (APARECEN A PARTIR DEL KM 88 TRAS LA PAUSA DE CARRETERA LIBRE)
            if (distanceKm >= 88.0) {
                ctx.save();
                const cholulaPct = Math.min(1, (distanceKm - 88.0) / 32.0);
                const scale = 0.35 + cholulaPct * 1.85;
                const pX = 180;
                const pY = horizonY;

                // Cerro / Pirámide prehispánica verde escalonada
                ctx.fillStyle = "#1e7e34";
                ctx.beginPath();
                ctx.moveTo(pX - 110 * scale, pY);
                ctx.lineTo(pX - 70 * scale, pY - 25 * scale);
                ctx.lineTo(pX - 50 * scale, pY - 25 * scale);
                ctx.lineTo(pX - 32 * scale, pY - 45 * scale);
                ctx.lineTo(pX + 32 * scale, pY - 45 * scale);
                ctx.lineTo(pX + 50 * scale, pY - 25 * scale);
                ctx.lineTo(pX + 70 * scale, pY - 25 * scale);
                ctx.lineTo(pX + 110 * scale, pY);
                ctx.closePath();
                ctx.fill();

                // Terrazas de vegetación
                ctx.fillStyle = "#145a32";
                ctx.fillRect(Math.round(pX - 65 * scale), Math.round(pY - 23 * scale), 130 * scale, 3 * scale);
                ctx.fillRect(Math.round(pX - 45 * scale), Math.round(pY - 43 * scale), 90 * scale, 3 * scale);

                // Santuario de la Virgen de los Remedios (Iglesia Amarilla Colonial)
                const churchY = pY - 45 * scale;
                ctx.fillStyle = "#d97706";
                ctx.fillRect(Math.round(pX - 22 * scale), Math.round(churchY - 20 * scale), 44 * scale, 20 * scale);

                // Cúpula central
                ctx.fillStyle = "#eab308";
                ctx.beginPath();
                ctx.arc(pX, churchY - 20 * scale, 10 * scale, Math.PI, 0);
                ctx.fill();

                // Torres campanario laterales
                ctx.fillStyle = "#f59e0b";
                ctx.fillRect(Math.round(pX - 22 * scale), Math.round(churchY - 36 * scale), 9 * scale, 16 * scale);
                ctx.fillRect(Math.round(pX + 13 * scale), Math.round(churchY - 36 * scale), 9 * scale, 16 * scale);

                // Cúpulas de las torres
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(Math.round(pX - 21 * scale), Math.round(churchY - 40 * scale), 7 * scale, 4 * scale);
                ctx.fillRect(Math.round(pX + 14 * scale), Math.round(churchY - 40 * scale), 7 * scale, 4 * scale);

                // Cruces en la cima
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(Math.round(pX - 18 * scale), Math.round(churchY - 45 * scale), 1.5 * scale, 5 * scale);
                ctx.fillRect(Math.round(pX + 17 * scale), Math.round(churchY - 45 * scale), 1.5 * scale, 5 * scale);
                ctx.fillRect(Math.round(pX), Math.round(churchY - 34 * scale), 1.5 * scale, 6 * scale);

                ctx.restore();
            }

            // Nubes flotando
            ctx.fillStyle = "#ffffff";
            ctx.font = "24px sans-serif";
            const cloud1X = (roadFrame * 0.45) % (canvas.width + 60) - 30;
            const cloud2X = ((roadFrame * 0.25) + 190) % (canvas.width + 60) - 30;
            ctx.fillText("☁️", cloud1X, 55);
            ctx.fillText("☁️", cloud2X, 95);

            // 2. PASTO VERDE DE FONDO
            ctx.fillStyle = "#27ae60"; 
            ctx.fillRect(0, horizonY, canvas.width, roadHeight);

            // CÁLCULO DE CURVATURA EN LA ZONA DE MONTAÑA (ENTRE CASETA RÍO FRÍO KM 45 Y SAN MARTÍN KM 95)
            if (distanceKm >= 45.0 && distanceKm <= 95.0) {
                targetRoadCurve = Math.sin(roadFrame * 0.038) * 115 + Math.cos(roadFrame * 0.018) * 35;
            } else {
                targetRoadCurve = 0;
            }
            currentRoadCurve += (targetRoadCurve - currentRoadCurve) * 0.08;

            // 3. ASFALTO DE LA CARRETERA (SUPERFICIE CURVA OUTRUN CONTINUA Y LISA)
            ctx.fillStyle = "#2c3e50";
            ctx.beginPath();
            ctx.moveTo(getPueblaRoadCenter(horizonY) - 20, horizonY);

            // Borde izquierdo curvo
            for (let step = 0; step <= 12; step++) {
                const stepY = horizonY + (step / 12) * roadHeight;
                const stepDepth = (stepY - horizonY) / roadHeight;
                const stepCenter = getPueblaRoadCenter(stepY);
                const stepWidth = 40 + stepDepth * 260;
                ctx.lineTo(stepCenter - stepWidth / 2, stepY);
            }
            // Borde derecho curvo
            for (let step = 12; step >= 0; step--) {
                const stepY = horizonY + (step / 12) * roadHeight;
                const stepDepth = (stepY - horizonY) / roadHeight;
                const stepCenter = getPueblaRoadCenter(stepY);
                const stepWidth = 40 + stepDepth * 260;
                ctx.lineTo(stepCenter + stepWidth / 2, stepY);
            }
            ctx.closePath();
            ctx.fill();

            // 4. LÓGICA DE DISTANCIA REAL DE CDMX A CHOLULA (120 KM TOTALES - AVANCE RALENTIZADO 2.8X)
            if (distanceKm < 120) {
                distanceKm += (roadSpeed / 8.5) * 0.055;
                if (distanceKm > 120) distanceKm = 120;
            }

            // GENERAR CASETAS EN KM REALES (Río Frío km 45, San Martín km 95, Cholula km 120)
            if (distanceKm >= 45.0 && !rioFrioSpawned) {
                rioFrioSpawned = true;
                tollGates.push({ name: "CASETA RÍO FRÍO (KM 45)", y: horizonY, passed: false, color: "#16a34a" });
            } else if (distanceKm >= 95.0 && !sanMartinSpawned) {
                sanMartinSpawned = true;
                tollGates.push({ name: "CASETA SAN MARTÍN (KM 95)", y: horizonY, passed: false, color: "#16a34a" });
            } else if (distanceKm >= 120.0 && !cholulaSpawned) {
                cholulaSpawned = true;
                tollGates.push({ name: "¡BIENVENIDO A CHOLULA! ⛪ (KM 120)", y: horizonY, passed: false, isFinal: true, color: "#0284c7" });
            }

            // GENERAR LETREROS MEXICANOS VERDES DE CARRETERA (SIN REPETICIONES DE LOS ÚLTIMOS 4)
            if (roadFrame % 65 === 0) {
                const side = Math.random() < 0.5 ? -1 : 1;
                const isExit = Math.random() < 0.12; // 12% probabilidad de letrero de salida
                let textVal = "";
                let arrowVal = "";
                let distVal = "500 m";
                
                if (isExit) {
                    textVal = "SALIDA";
                    arrowVal = side === -1 ? "⬿" : "➔";
                    distVal = "300 m";
                } else {
                    // Filtrar para evitar repetir letreros recientes
                    let available = PUEBLA_SIGNS.filter(s => !recentSignTexts.includes(s.text));
                    if (available.length === 0) {
                        recentSignTexts = [];
                        available = PUEBLA_SIGNS;
                    }
                    const signData = available[Math.floor(Math.random() * available.length)];
                    textVal = signData.text;
                    arrowVal = side === -1 ? "⬿" : signData.arrow;
                    
                    recentSignTexts.push(textVal);
                    if (recentSignTexts.length > 4) recentSignTexts.shift();

                    // Distancias dinámicas reales según los kilómetros recorridos en vivo
                    if (textVal === "CHOLULA") {
                        distVal = `${Math.max(1, Math.round(120 - distanceKm))} km`;
                    } else if (textVal === "VAL'QUIRICO") {
                        distVal = `${Math.max(1, Math.round(85 - distanceKm))} km`;
                    } else if (textVal === "SAN MARTÍN") {
                        distVal = `${Math.max(1, Math.round(95 - distanceKm))} km`;
                    } else if (textVal === "PUEBLA CENTRO") {
                        distVal = `${Math.max(1, Math.round(125 - distanceKm))} km`;
                    } else if (textVal === "ATLIXCO") {
                        distVal = `${Math.max(1, Math.round(140 - distanceKm))} km`;
                    } else if (textVal === "CATEDRAL") {
                        distVal = `${Math.max(1, Math.round(126 - distanceKm))} km`;
                    } else if (textVal === "FUERTES LORETO") {
                        distVal = `${Math.max(1, Math.round(122 - distanceKm))} km`;
                    } else if (textVal === "TELÉFERICO") {
                        distVal = `${Math.max(1, Math.round(124 - distanceKm))} km`;
                    } else if (textVal === "AFRICAM SAFARI") {
                        distVal = `${Math.max(1, Math.round(135 - distanceKm))} km`;
                    } else {
                        distVal = signData.dist;
                    }
                }

                sceneryObjects.push({
                    y: horizonY,
                    text: textVal,
                    arrow: arrowVal,
                    dist: distVal,
                    side: side
                });
            }

            // DIBUJAR BORDES Y LÍNEAS DIVISORIAS EN PERSPECTIVA CURVA
            const totalStripeSegments = 12;
            for (let i = totalStripeSegments; i >= 1; i--) {
                const y1 = horizonY + Math.pow((i - 1) / totalStripeSegments, 2) * roadHeight;
                const y2 = horizonY + Math.pow(i / totalStripeSegments, 2) * roadHeight;
                
                const stripeActive = (i + Math.floor(roadFrame / 2.5)) % 2 === 0;

                const roadWidth1 = 40 + ((y1 - horizonY) / roadHeight) * 260;
                const roadWidth2 = 40 + ((y2 - horizonY) / roadHeight) * 260;
                const centerX1 = getPueblaRoadCenter(y1);
                const centerX2 = getPueblaRoadCenter(y2);

                const xl1 = centerX1 - roadWidth1 / 2;
                const xl2 = centerX2 - roadWidth2 / 2;
                const xr1 = centerX1 + roadWidth1 / 2;
                const xr2 = centerX2 + roadWidth2 / 2;

                // Cordón lateral (blanco / rojo)
                ctx.fillStyle = stripeActive ? "#e74c3c" : "#ffffff";
                ctx.beginPath();
                ctx.moveTo(xl1 - 7, y1); ctx.lineTo(xl2 - 11, y2);
                ctx.lineTo(xl2, y2); ctx.lineTo(xl1, y1);
                ctx.fill();

                ctx.beginPath();
                ctx.moveTo(xr1, y1); ctx.lineTo(xr2, y2);
                ctx.lineTo(xr2 + 11, y2); ctx.lineTo(xr1 + 7, y1);
                ctx.fill();

                // Líneas divisorias amarillas
                if (stripeActive) {
                    ctx.strokeStyle = "#f1c40f";
                    ctx.lineWidth = 1.5 + (i / totalStripeSegments) * 3;

                    const lineL1 = xl1 + roadWidth1 / 3;
                    const lineL2 = xl2 + roadWidth2 / 3;
                    ctx.beginPath();
                    ctx.moveTo(lineL1, y1); ctx.lineTo(lineL2, y2);
                    ctx.stroke();

                    const lineR1 = xl1 + (2 * roadWidth1) / 3;
                    const lineR2 = xl2 + (2 * roadWidth2) / 3;
                    ctx.beginPath();
                    ctx.moveTo(lineR1, y1); ctx.lineTo(lineR2, y2);
                    ctx.stroke();
                }
            }

            // 5. ANIMAR Y DIBUJAR LETREROS SCT (IZQUIERDA Y DERECHA SIGUIENDO LA CURVA)
            for (let i = sceneryObjects.length - 1; i >= 0; i--) {
                let sc = sceneryObjects[i];
                sc.y += roadSpeed * 0.42;
                const depthPct = Math.max(0, Math.min(1, (sc.y - horizonY) / roadHeight));
                const currentRoadWidth = 40 + depthPct * 260;
                const centerAtY = getPueblaRoadCenter(sc.y);
                
                const sideDir = sc.side || 1;
                const roadEdgeX = sideDir < 0 ? (centerAtY - currentRoadWidth / 2) : (centerAtY + currentRoadWidth / 2);
                const scX = sideDir < 0 ? (roadEdgeX - 26 - depthPct * 65) : (roadEdgeX + 26 + depthPct * 65);
                
                const scale = 0.32 + depthPct * 0.95;
                const signW = Math.round(112 * scale);
                const signH = Math.round(58 * scale);
                const postH = Math.round(38 * scale);
                const signBottomY = sc.y;
                const signTopY = signBottomY - signH - postH;

                ctx.save();
                // Poste metálico
                ctx.fillStyle = "#95a5a6";
                const poleW = Math.max(2, Math.round(4 * scale));
                ctx.fillRect(Math.round(scX - poleW / 2), Math.round(signBottomY - postH), poleW, postH);

                // Letrero Verde SCT Oficial
                ctx.fillStyle = "#1b5e20"; 
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = Math.max(1.5, Math.round(2.5 * scale));
                
                ctx.fillRect(Math.round(scX - signW / 2), Math.round(signTopY), signW, signH);
                ctx.strokeRect(Math.round(scX - signW / 2), Math.round(signTopY), signW, signH);

                // Borde interior blanco fino
                ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
                ctx.lineWidth = Math.max(0.8, scale);
                ctx.strokeRect(Math.round(scX - signW / 2 + 2.5 * scale), Math.round(signTopY + 2.5 * scale), signW - 5 * scale, signH - 5 * scale);

                // Texto del destino en mayúsculas
                ctx.fillStyle = "#ffffff";
                const fontSize = Math.max(7, Math.round(12 * scale));
                ctx.font = `bold ${fontSize}px sans-serif`;
                ctx.textAlign = "center";
                ctx.fillText(sc.text, Math.round(scX), Math.round(signTopY + 18 * scale));

                // Flecha direccional y distancia
                const arrowFontSize = Math.max(8, Math.round(14 * scale));
                ctx.font = `bold ${arrowFontSize}px sans-serif`;
                ctx.fillText(`${sc.arrow}  ${sc.dist}`, Math.round(scX), Math.round(signTopY + 40 * scale));
                ctx.restore();

                if (sc.y > canvas.height + 90) {
                    sceneryObjects.splice(i, 1);
                }
            }

            // 6. GENERAR OBSTÁCULOS E ÍTEMS EN LOS CARRILES (MÁS TIEMPO DE VISIÓN EN CURVAS)
            const isCurveZone = distanceKm >= 45.0 && distanceKm <= 95.0;
            const baseSpawn = Math.max(14, Math.floor(28 - (distanceKm / 120.0) * 14));
            const spawnInterval = isCurveZone ? baseSpawn + 10 : baseSpawn;
            if (roadFrame % spawnInterval === 0) {
                const laneIdx = Math.floor(Math.random() * 3);
                const rollType = Math.random();
                let typeEmoji = "🚧";
                let isItem = false;
                let isTrafficCar = false;
                let trafficImg = null;
                let pts = 0;

                if (rollType > 0.85) {
                    // Ítems de bonificación (Chalupas 🌮 o Turbo ⚡) +3 pts (15%)
                    const isTaco = Math.random() > 0.5;
                    typeEmoji = isTaco ? "🌮" : "⚡";
                    isItem = true;
                    pts = 3;
                } else if (rollType > 0.05) {
                    // Autos de tráfico a rebasar vistos desde atrás usando los Sprite Defs
                    let def;
                    let attempts = 0;
                    do {
                        def = trafficSpriteDefs[Math.floor(Math.random() * trafficSpriteDefs.length)];
                        attempts++;
                    } while (lastSpawnedCars.includes(def) && attempts < 20);
                    
                    lastSpawnedCars.push(def);
                    if (lastSpawnedCars.length > 3) lastSpawnedCars.shift();
                    
                    trafficImg = def;
                    isTrafficCar = true;
                } else {
                    // Baches u obras (solo 5% de probabilidad, muy raros)
                    typeEmoji = Math.random() > 0.5 ? "🚧" : "🕳️";
                }

                roadObjects.push({
                    lane: laneIdx,
                    y: horizonY,
                    emoji: typeEmoji,
                    isItem: isItem,
                    isCar: isTrafficCar,
                    trafficImg: trafficImg,
                    pts: pts,
                    speed: isTrafficCar ? (4.0 + (distanceKm / 120.0) * 1.5) : 0 
                });
            }

            // 7. ANIMAR Y DIBUJAR OBJETOS EN LOS CARRILES CON COLISIÓN PRECISA (HITBOX REAL)
            for (let i = roadObjects.length - 1; i >= 0; i--) {
                let obj = roadObjects[i];
                
                // Desplazamiento visible y fluido hacia el carril despejado
                if (obj.isPulledAside && obj.destLane !== undefined) {
                    const diff = obj.destLane - obj.lane;
                    if (Math.abs(diff) > 0.02) {
                        // Cruza de carril visiblemente a ~0.08 por frame (~0.35s de transición fluida)
                        obj.lane += Math.sign(diff) * Math.min(Math.abs(diff), 0.08);
                    } else {
                        obj.lane = obj.destLane;
                    }
                }

                if (obj.isCar || obj.isPulledAside) {
                    obj.y += roadSpeed - (obj.speed || 4.5); 
                } else {
                    obj.y += roadSpeed; 
                }

                const currentLaneX = getPueblaLaneX(obj.lane, obj.y);
                const depthPct = Math.max(0, Math.min(1, (obj.y - horizonY) / roadHeight));
                const currentScale = Math.max(18, Math.floor(16 + depthPct * 34));
                const objWidth = currentScale * 0.85;

                // Para dibujar autos PNG autocroppeados
                let drawnCropped = false;
                ctx.save();
                if (obj.isPulledAside && (Math.floor(roadFrame / 4) % 2 === 0)) {
                    // Parpadeo sutil de direccional de cortesía al orillarse
                    ctx.globalAlpha = 0.85;
                }
                if ((obj.isCar || obj.isPulledAside) && obj.trafficImg && obj.trafficImg.img && obj.trafficImg.img.complete && obj.trafficImg.img.naturalWidth !== 0) {
                    const def = obj.trafficImg;
                    const cropped = getTightlyCroppedSprite(def.img, def.cols, def.rows, def.c, def.r);
                    if (cropped) {
                        ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
                        ctx.shadowBlur = 4;
                        ctx.shadowOffsetY = 2;
                        ctx.imageSmoothingEnabled = true;
                        
                        // Escalar con base en la proporcion real del coche extraido
                        const carW = Math.round(objWidth * 1.4);
                        const carH = Math.round(carW * (cropped.height / cropped.width));
                        ctx.drawImage(cropped, Math.round(currentLaneX - carW / 2), Math.round(obj.y - carH / 2), carW, carH);
                        drawnCropped = true;
                    }
                }
                
                if (!drawnCropped) {
                    ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
                    ctx.shadowBlur = 4;
                    ctx.shadowOffsetY = 2;
                    ctx.font = `${currentScale}px sans-serif`;
                    ctx.textAlign = "center";
                    ctx.fillText(obj.emoji, Math.round(currentLaneX), Math.round(obj.y));
                }
                ctx.restore();

                // COLISIÓN CON EL HITBOX JUSTO DEL AUTO ROJO DEPORTIVO (x=playerX, y=440, w=48, h=28)
                const hitX = Math.abs(currentLaneX - playerX) < (18 + objWidth * 0.4);
                const hitY = Math.abs(obj.y - 440) < 18;

                if (hitX && hitY) {
                    if (obj.isItem) {
                        bonusScore += obj.pts;
                        playSound('coin');
                        triggerHaptic(30); 
                        roadObjects.splice(i, 1);
                        continue;
                    } else if (obj.isCar) {
                        // Impacto real por solapamiento directo
                        const currentFinalScore = Math.floor((distanceKm / 120.0) * 200) + bonusScore;
                        triggerHaptic(250);
                        gameOver(currentFinalScore, false);
                        return;
                    }
                }

                if (obj.y > canvas.height + 40) {
                    roadObjects.splice(i, 1);
                }
            }

            // 8. JUGADOR (Auto Deportivo Rojo Retro Visto Desde Atrás 🚗)
            const playerTargetX = getPueblaLaneX(targetLane, 440);
            playerX += (playerTargetX - playerX) * 0.45; 

            drawRearViewCar(ctx, playerX, 440, 62, 38);

            // 9. ANIMAR Y DIBUJAR CASETAS DE COBRO / ARCO DE CHOLULA (SIGUIENDO LA CURVA Y DIBUJADAS TRAS EL AUTO PARA QUE PASE POR DEBAJO)
            for (let i = tollGates.length - 1; i >= 0; i--) {
                let gate = tollGates[i];
                gate.y += roadSpeed * 0.52;
                
                const depthPct = Math.max(0, Math.min(1, (gate.y - horizonY) / roadHeight));
                const currentRoadWidth = 40 + depthPct * 260;
                const centerAtY = getPueblaRoadCenter(gate.y);
                const scale = 0.35 + depthPct * 0.95;

                const leftPillarX = centerAtY - currentRoadWidth / 2 - 8 * scale;
                const rightPillarX = centerAtY + currentRoadWidth / 2 + 8 * scale;
                const archY = gate.y - 65 * scale;
                const archW = currentRoadWidth + 35 * scale;
                const archH = Math.round(28 * scale);
                const pillarW = Math.round(12 * scale);
                const pillarH = Math.round(65 * scale);

                ctx.save();
                // Pilares de la caseta
                ctx.fillStyle = "#64748b";
                ctx.fillRect(Math.round(leftPillarX - pillarW / 2), Math.round(gate.y - pillarH), pillarW, pillarH);
                ctx.fillRect(Math.round(rightPillarX - pillarW / 2), Math.round(gate.y - pillarH), pillarW, pillarH);
                ctx.strokeStyle = "#0f172a";
                ctx.lineWidth = Math.max(1, scale);
                ctx.strokeRect(Math.round(leftPillarX - pillarW / 2), Math.round(gate.y - pillarH), pillarW, pillarH);
                ctx.strokeRect(Math.round(rightPillarX - pillarW / 2), Math.round(gate.y - pillarH), pillarW, pillarH);

                // Viga / Letrero superior de la caseta (DIBUJADO POR ENCIMA DEL AUTO)
                ctx.fillStyle = gate.color || "#16a34a";
                ctx.fillRect(Math.round(centerAtY - archW / 2), Math.round(archY), archW, archH);
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = Math.max(1.5, 2.5 * scale);
                ctx.strokeRect(Math.round(centerAtY - archW / 2), Math.round(archY), archW, archH);

                // Texto de la Caseta
                ctx.fillStyle = "#ffffff";
                const gateFontSize = Math.max(7, Math.round(11 * scale));
                ctx.font = `bold ${gateFontSize}px sans-serif`;
                ctx.textAlign = "center";
                ctx.fillText(gate.name, centerAtY, Math.round(archY + 18 * scale));
                ctx.restore();

                // Lógica de paso por la caseta
                if (gate.y >= 430 && !gate.passed && !gate.isFinal) {
                    gate.passed = true;
                    bonusScore += 5;
                    playSound('coin');
                        triggerHaptic(30);
                } else if (gate.y >= 540 && !gate.passed && gate.isFinal) { // Cruza completamente la pantalla antes de ganar
                    gate.passed = true;
                    const totalFinalScore = Math.floor((distanceKm / 120.0) * 200) + bonusScore;
                    gameOver(totalFinalScore, true);
                    return;
                }

                if (gate.y > canvas.height + 100) {
                    tollGates.splice(i, 1);
                }
            }

            // Incremento progresivo de velocidad y distancia (0 a 120 KM)
            roadSpeed = 8.5 + Math.min(6.5, (distanceKm / 120.0) * 6.5); 

            // CÁLCULO DE PUNTUACIÓN: 200 PTS POR DISTANCIA (120 KM) + BONUS POR POWER-UPS
            const distBaseScore = Math.floor((distanceKm / 120.0) * 200);
            score = distBaseScore + bonusScore;

            drawRetroScore(ctx, score, canvas.width - 20, 20);
            currentGameScore.innerText = score.toString().padStart(5, '0');

            // EASTER EGG: BANNER DEL CLAXON NUPCIAL "¡ABRAN PASO A LOS NOVIOS!"
            if (pueblaHornBannerTimer > 0) {
                pueblaHornBannerTimer--;
                ctx.save();
                ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
                ctx.fillRect(20, 42, canvas.width - 40, 32);
                ctx.strokeStyle = "#fbbf24";
                ctx.lineWidth = 2;
                ctx.strokeRect(20, 42, canvas.width - 40, 32);
                ctx.fillStyle = "#fef08a";
                ctx.font = "bold 13px font-monogram, sans-serif";
                ctx.textAlign = "center";
                ctx.fillText("🎺 ¡ABRAN PASO A LOS NOVIOS! 🚗💨", canvas.width / 2, 63);
                ctx.restore();
            }

            // HUD EN PANTALLA CON KILÓMETROS REALES
            ctx.save();
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 13px font-monogram, sans-serif";
            ctx.textAlign = "left";
            ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
            ctx.shadowBlur = 4;
            ctx.fillText(`📍 ${distanceKm.toFixed(1)} / 120 km`, 16, 26);
            ctx.restore();
        }
