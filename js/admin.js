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

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

const METAS = {
    chico: 350,
    chica: 30,
    maddie: 25,
    puebla: 200
};

// CATÁLOGO OFICIAL DE LA TIENDA (18 VARIANTES = 220 ARTÍCULOS TOTALES, SIN PANTUFLAS)
// Economía diseñada para 200 invitados (Valor Total Tienda: 735,000 ChiCoins):
// - Nivel 1 (Exclusivo: 5,200 - 5,500 🪙): Sudadera y Set de Vino
// - Nivel 2 (Premium: 3,800 - 4,200 🪙): Barber Neceser, Cosmetiquera Grande, Taza Matte, Chalina
// - Nivel 3 (Intermedio: 2,800 - 3,200 🪙): Bolsa de Yute, Vaso Cervecero, Cosmetiquera Blanca, Juego Flop
// - Nivel 4 (Entrada Anti-Acaparamiento: 1,800 - 2,400 🪙): Tote Bag, Porta Vasos, Libreta, Destapadores, Auch
const DEFAULT_INVENTORY = {
    item_01_sudadera_m: {
        id: "item_01_sudadera_m",
        emoji: "🧥",
        name: "Sudadera (Talla M)",
        cost: 5500,
        stock: 10,
        initialStock: 10,
        order: 1
    },
    item_02_sudadera_l: {
        id: "item_02_sudadera_l",
        emoji: "🧥",
        name: "Sudadera (Talla L)",
        cost: 5500,
        stock: 10,
        initialStock: 10,
        order: 2
    },
    item_03_sudadera_xl: {
        id: "item_03_sudadera_xl",
        emoji: "🧥",
        name: "Sudadera (Talla XL)",
        cost: 5500,
        stock: 10,
        initialStock: 10,
        order: 3
    },
    item_04_set_vino: {
        id: "item_04_set_vino",
        emoji: "🍷",
        name: "Set de Vino Caja de Madera",
        cost: 5200,
        stock: 10,
        initialStock: 10,
        order: 4
    },
    item_05_barber_neceser: {
        id: "item_05_barber_neceser",
        emoji: "💈",
        name: "Barber Neceser",
        cost: 4200,
        stock: 15,
        initialStock: 15,
        order: 5
    },
    item_06_cosmetiquera_negra: {
        id: "item_06_cosmetiquera_negra",
        emoji: "🖤",
        name: "Cosmetiquera Grande Negra",
        cost: 4000,
        stock: 10,
        initialStock: 10,
        order: 6
    },
    item_07_taza_negro_matte: {
        id: "item_07_taza_negro_matte",
        emoji: "☕",
        name: "Taza Negro Matte Grabada",
        cost: 3800,
        stock: 15,
        initialStock: 15,
        order: 7
    },
    item_08_chalina: {
        id: "item_08_chalina",
        emoji: "🧣",
        name: "Chalina",
        cost: 3800,
        stock: 10,
        initialStock: 10,
        order: 8
    },
    item_09_bolsa_yute: {
        id: "item_09_bolsa_yute",
        emoji: "👜",
        name: "Bolsa de Yute Mayan",
        cost: 3200,
        stock: 10,
        initialStock: 10,
        order: 9
    },
    item_10_vaso_cervecero: {
        id: "item_10_vaso_cervecero",
        emoji: "🍺",
        name: "Vaso Cervecero",
        cost: 3000,
        stock: 15,
        initialStock: 15,
        order: 10
    },
    item_11_cosmetiquera_blanca: {
        id: "item_11_cosmetiquera_blanca",
        emoji: "🤍",
        name: "Cosmetiquera Rect. Blanca",
        cost: 3000,
        stock: 10,
        initialStock: 10,
        order: 11
    },
    item_12_juego_flop: {
        id: "item_12_juego_flop",
        emoji: "🎯",
        name: "Juego Flop",
        cost: 2800,
        stock: 10,
        initialStock: 10,
        order: 12
    },
    item_13_tote_bag: {
        id: "item_13_tote_bag",
        emoji: "🛍️",
        name: "Tote Bag",
        cost: 2400,
        stock: 30,
        initialStock: 30,
        order: 13
    },
    item_14_porta_vasos: {
        id: "item_14_porta_vasos",
        emoji: "🥃",
        name: "Porta Vasos Porso",
        cost: 2400,
        stock: 10,
        initialStock: 10,
        order: 14
    },
    item_15_libreta_lamba: {
        id: "item_15_libreta_lamba",
        emoji: "📓",
        name: "Libreta Lamba",
        cost: 2200,
        stock: 10,
        initialStock: 10,
        order: 15
    },
    item_16_destapador_snap: {
        id: "item_16_destapador_snap",
        emoji: "🍾",
        name: "Destapador Snap",
        cost: 2200,
        stock: 10,
        initialStock: 10,
        order: 16
    },
    item_17_destapador_opener: {
        id: "item_17_destapador_opener",
        emoji: "🍺",
        name: "Destapador Opener",
        cost: 1800,
        stock: 15,
        initialStock: 15,
        order: 17
    },
    item_18_auch: {
        id: "item_18_auch",
        emoji: "🩹",
        name: "Auch",
        cost: 1800,
        stock: 10,
        initialStock: 10,
        order: 18
    }
};

let allPlayers = {};
let allInventory = JSON.parse(JSON.stringify(DEFAULT_INVENTORY));
let selectedPlayerKey = null;
let isRedeeming = false;
let isSandboxMode = sessionStorage.getItem("bodachicos_admin_sandbox") === "true";
let currentInventoryRef = null;
let currentPlayersRef = null;
let hasAttemptedInventoryInit = false;
let lastPlayersSerialized = "";

const LS_SANDBOX_PLAYERS = "bodachicos_sandbox_players_v1";
const LS_SANDBOX_INVENTORY = "bodachicos_sandbox_inventory_v1";
const LS_PROD_INVENTORY_CACHE = "bodachicos_prod_inventory_v1";

function cloneDeep(obj) {
    return JSON.parse(JSON.stringify(obj || {}));
}

function getLocalSandboxPlayers() {
    try {
        const raw = localStorage.getItem(LS_SANDBOX_PLAYERS);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}

function saveLocalSandboxPlayers(map) {
    try {
        localStorage.setItem(LS_SANDBOX_PLAYERS, JSON.stringify(map || {}));
    } catch (e) {}
}

function getLocalInventoryCache(forSandbox) {
    try {
        const key = forSandbox ? LS_SANDBOX_INVENTORY : LS_PROD_INVENTORY_CACHE;
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}

function saveLocalInventoryCache(forSandbox, invMap) {
    try {
        const key = forSandbox ? LS_SANDBOX_INVENTORY : LS_PROD_INVENTORY_CACHE;
        localStorage.setItem(key, JSON.stringify(invMap || DEFAULT_INVENTORY));
    } catch (e) {}
}

// Envuelve el inventario con propiedades válidas de jugador por si las reglas .validate de /players/$id las exigen
function wrapInventoryNodeForFirebase(invItems) {
    return {
        gamerTag: "__inventory__",
        guestId: "__inventory__",
        realName: "__system__",
        partyId: "system",
        scores: { chico: 0, chica: 0, maddie: 0, puebla: 0 },
        chiCoins: { chico: 0, chica: 0, maddie: 0, puebla: 0 },
        bonusCoins: 0,
        adminBonus: 0,
        totalChiCoins: 0,
        totalScore: 0,
        timePlayedSeconds: 0,
        lastUpdated: Date.now(),
        items: invItems
    };
}

function unwrapInventoryNode(rawVal) {
    if (!rawVal || typeof rawVal !== "object") return null;
    if (rawVal.items && typeof rawVal.items === "object") {
        return rawVal.items;
    }
    // Si tiene llaves directas item_*
    const hasDirectItems = Object.keys(rawVal).some(k => k.startsWith("item_"));
    if (hasDirectItems) {
        const extracted = {};
        Object.keys(rawVal).forEach(k => {
            if (k.startsWith("item_") && rawVal[k] && typeof rawVal[k] === "object") {
                extracted[k] = rawVal[k];
            }
        });
        return Object.keys(extracted).length > 0 ? extracted : null;
    }
    return null;
}

function extractCleanPlayers(rawMap) {
    const clean = {};
    if (!rawMap || typeof rawMap !== "object") return clean;
    Object.keys(rawMap).forEach(k => {
        if (k.startsWith("__") || k.startsWith("item_")) return;
        const node = rawMap[k];
        if (!node || typeof node !== "object") return;
        if (node.gamerTag === "__inventory__" || node.realName === "__system__") return;
        if (node.gamerTag !== undefined || node.scores !== undefined || node.totalChiCoins !== undefined || node.realName !== undefined) {
            clean[k] = node;
        }
    });
    return clean;
}

document.addEventListener("DOMContentLoaded", () => {
    checkAdminAuth();
    updateEnvironmentUI();

    const tableBody = document.getElementById("playersTableBody");
    if (tableBody) {
        tableBody.addEventListener("click", (e) => {
            const row = e.target.closest("tr[data-player-key]");
            if (row && row.dataset.playerKey) {
                selectPlayer(decodeURIComponent(row.dataset.playerKey));
            }
        });
    }

    // Sincronizar cambios entre pestañas cuando se usa el modo Sandbox en el mismo navegador
    window.addEventListener("storage", (e) => {
        if (!isSandboxMode) return;
        if (e.key === LS_SANDBOX_PLAYERS) {
            const localPlayers = getLocalSandboxPlayers();
            if (localPlayers) {
                allPlayers = extractCleanPlayers(localPlayers);
                renderPlayersTable();
                if (selectedPlayerKey && allPlayers[selectedPlayerKey]) {
                    selectPlayer(selectedPlayerKey, true);
                }
            }
        } else if (e.key === LS_SANDBOX_INVENTORY) {
            const localInv = getLocalInventoryCache(true);
            if (localInv) {
                allInventory = localInv;
                updateLiveInventoryBanner();
                renderRedeemableItems();
                renderInventoryManagerTable();
            }
        }
    });

    listenToInventory();
    listenToPlayers();
});

function checkAdminAuth() {
    if (sessionStorage.getItem("bodachicos_admin_auth") !== "true") {
        const pass = prompt("🔐 Acceso Administrador - Ingresa la contraseña:");
        if (pass && (pass.trim() === "Chicos0212" || pass.trim().toLowerCase() === "souvenir")) {
            sessionStorage.setItem("bodachicos_admin_auth", "true");
        } else {
            alert("Acceso denegado: Contraseña incorrecta.");
            window.location.href = "juegos.html";
        }
    }
}

function updateEnvironmentUI() {
    const banner = document.getElementById("sandboxActiveBanner");
    const btn = document.getElementById("envModeToggleBtn");
    const label = document.getElementById("envModeToggleLabel");
    const arcadeLink = document.getElementById("goToArcadeLink");

    if (isSandboxMode) {
        if (banner) banner.classList.remove("hidden");
        if (btn) {
            btn.className = "inline-flex items-center px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-purple-600 hover:bg-purple-500 text-white border border-purple-300 transition cursor-pointer shadow-xs";
        }
        if (label) {
            label.innerText = "🧪 Pruebas (Volver a Prod)";
        }
        if (arcadeLink) {
            arcadeLink.href = "juegos.html?sandbox=1";
            arcadeLink.innerText = "🎮 Arcade Sandbox";
        }
    } else {
        if (banner) banner.classList.add("hidden");
        if (btn) {
            btn.className = "inline-flex items-center px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-white/15 hover:bg-white/25 text-white border border-white/25 transition cursor-pointer";
        }
        if (label) {
            label.innerText = "🟢 Producción (Ir a Pruebas)";
        }
        if (arcadeLink) {
            arcadeLink.href = "juegos.html";
            arcadeLink.innerText = "🎮 Arcade";
        }
    }
}

async function toggleSandboxMode() {
    isSandboxMode = !isSandboxMode;
    sessionStorage.setItem("bodachicos_admin_sandbox", isSandboxMode ? "true" : "false");

    selectedPlayerKey = null;
    lastPlayersSerialized = "";
    const noSelEl = document.getElementById("noSelectionState");
    if (noSelEl) noSelEl.classList.remove("hidden");
    const selState = document.getElementById("selectionState");
    if (selState) {
        selState.classList.add("hidden");
        selState.classList.remove("flex");
    }

    updateEnvironmentUI();

    if (isSandboxMode) {
        const existingSandbox = getLocalSandboxPlayers();
        if (!existingSandbox || Object.keys(existingSandbox).length === 0) {
            await cloneProdToSandbox(false);
        }
    }

    listenToInventory();
    listenToPlayers();
}

async function cloneProdToSandbox(askConfirmation) {
    if (askConfirmation) {
        if (!confirm("🔄 ¿Copiar los jugadores actuales de Producción y restablecer los 220 artículos del inventario en tu copia de Pruebas (Sandbox)?\n\n(Los datos reales de Producción NO se tocarán).")) {
            return;
        }
    }
    try {
        let prodPlayers = {};
        try {
            const prodPlayersSnap = await db.ref("players").once("value");
            prodPlayers = extractCleanPlayers(prodPlayersSnap.val() || {});
        } catch (e) {
            prodPlayers = cloneDeep(allPlayers);
        }

        const freshInv = cloneDeep(DEFAULT_INVENTORY);
        saveLocalSandboxPlayers(prodPlayers);
        saveLocalInventoryCache(true, freshInv);

        if (isSandboxMode) {
            allPlayers = prodPlayers;
            allInventory = freshInv;
            lastPlayersSerialized = "";
            updateLiveInventoryBanner();
            renderPlayersTable();
            renderRedeemableItems();
            renderInventoryManagerTable();
        }

        if (askConfirmation) {
            alert("✅ Copia de Pruebas (Sandbox) lista con los jugadores actuales de Producción y los 220 artículos.");
        }
    } catch (err) {
        console.warn("Aviso en cloneProdToSandbox:", err);
    }
}

// ==========================================
// CÁLCULO DETERMINÍSTICO DE SALDOS Y LOGS
// ==========================================
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

function computePlayerLedger(p) {
    if (!p) {
        return {
            gameCoins: { chico: 0, chica: 0, maddie: 0, puebla: 0 },
            hasAllMetasBonus: false,
            arcadeCoins: 0,
            activityLogsList: [],
            activityCoins: 0,
            redemptionLogsList: [],
            spentCoins: 0,
            netCoins: 0
        };
    }

    const scores = p.scores || {};
    const gameCoins = {
        chico: calculateGameChiCoins("chico", scores.chico || 0),
        chica: calculateGameChiCoins("chica", scores.chica || 0),
        maddie: calculateGameChiCoins("maddie", scores.maddie || 0),
        puebla: calculateGameChiCoins("puebla", scores.puebla || 0)
    };

    const pueblaDist = parseFloat(p.maxDistPuebla || 0);
    const isPueblaPassed = Boolean(p.pueblaWon || (scores.puebla || 0) >= METAS.puebla || pueblaDist >= 120);
    const hasAllMetasBonus = Boolean(
        (scores.chico || 0) >= METAS.chico &&
        (scores.chica || 0) >= METAS.chica &&
        (scores.maddie || 0) >= METAS.maddie &&
        isPueblaPassed
    );

    const arcadeCoins = gameCoins.chico + gameCoins.chica + gameCoins.maddie + gameCoins.puebla + (hasAllMetasBonus ? 500 : 0);

    const activityLogsObj = p.activityLogs || {};
    const activityLogsList = Object.keys(activityLogsObj)
        .map(k => ({ ...activityLogsObj[k], key: k }))
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    let activityCoins = activityLogsList.reduce((acc, item) => acc + (parseInt(item.amount) || 0), 0);

    const redemptionLogsObj = p.redemptionLogs || {};
    const redemptionLogsList = Object.keys(redemptionLogsObj)
        .map(k => ({ ...redemptionLogsObj[k], key: k }))
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    let spentCoins = redemptionLogsList.reduce((acc, item) => acc + (parseInt(item.cost) || 0), 0);

    if (activityLogsList.length === 0 && redemptionLogsList.length === 0) {
        const legacyBonus = parseInt(p.adminBonus !== undefined ? p.adminBonus : (p.bonusCoins || 0)) || 0;
        if (legacyBonus > 0) {
            activityCoins = legacyBonus;
        } else if (legacyBonus < 0) {
            spentCoins = Math.abs(legacyBonus);
        }
    }

    const netCoins = Math.max(0, arcadeCoins + activityCoins - spentCoins);

    return {
        gameCoins,
        hasAllMetasBonus,
        arcadeCoins,
        activityLogsList,
        activityCoins,
        redemptionLogsList,
        spentCoins,
        netCoins
    };
}

function formatTimeShort(ts) {
    if (!ts) return "";
    try {
        const d = new Date(ts);
        return d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
    } catch (e) {
        return "";
    }
}

// ==========================================
// GESTIÓN DE INVENTARIO EN TIEMPO REAL
// ==========================================
function normalizeSearchText(str) {
    return String(str || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function refreshInventoryUI() {
    saveLocalInventoryCache(isSandboxMode, allInventory);
    updateLiveInventoryBanner();
    renderRedeemableItems();
    renderInventoryManagerTable();
}

function persistInventoryState() {
    refreshInventoryUI();

    if (!isSandboxMode) {
        db.ref("players/__inventory__").set(wrapInventoryNodeForFirebase(allInventory)).catch(() => {});
    }
}

function persistSingleInventoryItem(itemId) {
    refreshInventoryUI();

    if (!isSandboxMode) {
        const item = allInventory[itemId] || null;
        db.ref(`players/__inventory__/items/${itemId}`).set(item).catch(() => {});
        db.ref("players/__inventory__/lastUpdated").set(Date.now()).catch(() => {});
    }
}

function listenToInventory() {
    if (currentInventoryRef) {
        currentInventoryRef.off("value");
        currentInventoryRef = null;
    }

    if (isSandboxMode) {
        const localInv = getLocalInventoryCache(true) || cloneDeep(DEFAULT_INVENTORY);
        allInventory = localInv;
        saveLocalInventoryCache(true, allInventory);
        updateLiveInventoryBanner();
        renderRedeemableItems();
        renderInventoryManagerTable();
        return;
    }

    // En Producción: cargar primero caché local o DEFAULT_INVENTORY inmediatamente sin bloquear UI
    const cachedProdInv = getLocalInventoryCache(false);
    allInventory = cachedProdInv || cloneDeep(DEFAULT_INVENTORY);
    updateLiveInventoryBanner();
    renderRedeemableItems();
    renderInventoryManagerTable();

    currentInventoryRef = db.ref("players/__inventory__");
    currentInventoryRef.on("value", (snapshot) => {
        const unwrapped = unwrapInventoryNode(snapshot.val());
        if (unwrapped && Object.keys(unwrapped).length > 0) {
            allInventory = unwrapped;
            saveLocalInventoryCache(false, allInventory);
            updateLiveInventoryBanner();
            renderRedeemableItems();
            renderInventoryManagerTable();
        } else if (!hasAttemptedInventoryInit) {
            hasAttemptedInventoryInit = true;
            db.ref("players/__inventory__").set(wrapInventoryNodeForFirebase(allInventory)).catch(() => {});
        }
    });
}

function getSortedInventoryList() {
    return Object.keys(allInventory)
        .map(k => ({ ...allInventory[k], id: k }))
        .sort((a, b) => (a.order || 999) - (b.order || 999));
}

function updateLiveInventoryBanner() {
    const items = getSortedInventoryList();
    let totalRemaining = 0;
    let totalInitial = 0;
    let outOfStockCount = 0;

    items.forEach(item => {
        const s = Math.max(0, parseInt(item.stock) || 0);
        const init = Math.max(s, parseInt(item.initialStock) || s);
        totalRemaining += s;
        totalInitial += init;
        if (s === 0) outOfStockCount++;
    });

    const remEl = document.getElementById("liveTotalItemsRemaining");
    const initEl = document.getElementById("liveTotalItemsInitial");
    const badgeEl = document.getElementById("lowStockAlertBadge");
    const countEl = document.getElementById("lowStockCount");

    if (remEl) remEl.innerText = totalRemaining.toLocaleString();
    if (initEl) initEl.innerText = `/ ${totalInitial.toLocaleString()} uds`;

    if (badgeEl && countEl) {
        if (outOfStockCount > 0) {
            countEl.innerText = outOfStockCount;
            badgeEl.classList.remove("hidden");
        } else {
            badgeEl.classList.add("hidden");
        }
    }
}

function toggleNewItemForm(forceOpen) {
    const formContainer = document.getElementById("newItemFormContainer");
    const chevron = document.getElementById("newItemFormChevron");
    if (!formContainer) return;

    const shouldOpen = typeof forceOpen === "boolean" ? forceOpen : formContainer.classList.contains("hidden");
    if (shouldOpen) {
        formContainer.classList.remove("hidden");
        if (chevron) chevron.innerText = "▲ Ocultar";
    } else {
        formContainer.classList.add("hidden");
        if (chevron) chevron.innerText = "▼ Mostrar";
    }
}

function toggleInventoryModal() {
    const modal = document.getElementById("inventoryModal");
    if (!modal) return;
    if (modal.classList.contains("hidden")) {
        modal.classList.remove("hidden");
        modal.classList.add("flex");
        toggleNewItemForm(false);
        renderInventoryManagerTable();
    } else {
        modal.classList.add("hidden");
        modal.classList.remove("flex");
    }
}

function renderInventoryManagerTable() {
    const tbody = document.getElementById("inventoryManagerTableBody");
    if (!tbody) return;

    const items = getSortedInventoryList();
    if (items.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="py-6 text-center text-gray-400 italic">No hay artículos en el inventario.</td></tr>`;
        return;
    }

    let html = "";
    items.forEach(item => {
        const stock = Math.max(0, parseInt(item.stock) || 0);
        const init = Math.max(stock, parseInt(item.initialStock) || stock);
        const cost = parseInt(item.cost) || 0;
        const isOut = stock === 0;
        const isLow = stock > 0 && stock <= 3;

        let stockBadgeClass = "bg-[#52582f]/10 text-[#52582f]";
        if (isOut) stockBadgeClass = "bg-red-50 text-red-600";
        else if (isLow) stockBadgeClass = "bg-amber-50 text-amber-700";

        html += `
            <tr class="hover:bg-gray-50 transition ${isOut ? 'opacity-50' : ''}">
                <td class="py-2 px-2 max-w-[130px] sm:max-w-none">
                    <div class="flex items-center gap-1.5 min-w-0">
                        <span class="text-sm shrink-0">${item.emoji || '🎁'}</span>
                        <span class="font-bold text-gray-800 text-[11px] sm:text-xs truncate">${item.name}</span>
                    </div>
                </td>
                <td class="py-2 px-1 text-center shrink-0">
                    <div class="inline-flex items-center bg-[#fcfaf7] border border-gray-200 rounded-lg px-1.5 py-0.5">
                        <input type="number" value="${cost}" onchange="updateInventoryItemCost('${item.id}', this.value)" class="w-14 sm:w-16 bg-transparent text-[#52582f] font-monogram font-bold text-center outline-none text-sm">
                    </div>
                </td>
                <td class="py-2 px-1 text-center shrink-0">
                    <span class="inline-block px-1.5 py-0.5 rounded-lg font-monogram font-bold text-xs ${stockBadgeClass}">
                        ${stock}/${init}
                    </span>
                </td>
                <td class="py-2 px-1.5 text-right shrink-0">
                    <div class="inline-flex items-center gap-1">
                        <button onclick="adjustInventoryItemStock('${item.id}', -1)" class="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold w-6 h-6 rounded-lg text-[11px] transition" title="Restar 1">-</button>
                        <button onclick="adjustInventoryItemStock('${item.id}', 1)" class="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold w-6 h-6 rounded-lg text-[11px] transition" title="Sumar 1">+</button>
                        <button onclick="deleteInventoryItem('${item.id}')" class="bg-red-50 hover:bg-red-100 text-red-600 font-bold w-6 h-6 rounded-lg text-[10px] transition" title="Eliminar">✕</button>
                    </div>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

function updateInventoryItemCost(itemId, newCostVal) {
    if (!allInventory[itemId]) return;
    const cost = Math.max(0, parseInt(newCostVal) || 0);
    allInventory[itemId].cost = cost;
    persistSingleInventoryItem(itemId);
}

function adjustInventoryItemStock(itemId, delta) {
    const item = allInventory[itemId];
    if (!item) return;
    const currentStock = parseInt(item.stock) || 0;
    const newStock = Math.max(0, currentStock + delta);
    const currentInit = parseInt(item.initialStock) || currentStock;
    const newInit = Math.max(currentInit, newStock);
    item.stock = newStock;
    item.initialStock = newInit;
    refreshInventoryUI();

    if (!isSandboxMode) {
        db.ref(`players/__inventory__/items/${itemId}`).transaction((serverItem) => {
            if (!serverItem) {
                return item;
            }
            const srvStock = parseInt(serverItem.stock) || 0;
            const nextStock = Math.max(0, srvStock + delta);
            const srvInit = parseInt(serverItem.initialStock) || srvStock;
            serverItem.stock = nextStock;
            serverItem.initialStock = Math.max(srvInit, nextStock);
            return serverItem;
        }).catch(() => {});
        db.ref("players/__inventory__/lastUpdated").set(Date.now()).catch(() => {});
    }
}

function createNewInventoryItem() {
    const emojiInput = document.getElementById("newItemEmoji");
    const nameInput = document.getElementById("newItemName");
    const costInput = document.getElementById("newItemCost");
    const stockInput = document.getElementById("newItemStock");

    const emoji = (emojiInput.value || "🎁").trim();
    const name = (nameInput.value || "").trim();
    const cost = parseInt(costInput.value);
    const stock = parseInt(stockInput.value);

    if (!name) {
        alert("Escribe el nombre del nuevo artículo.");
        return;
    }
    if (isNaN(cost) || cost <= 0) {
        alert("Ingresa un costo válido en ChiCoins (mayor a 0).");
        return;
    }
    if (isNaN(stock) || stock < 0) {
        alert("Ingresa una cantidad de inventario válida.");
        return;
    }

    const newId = "item_custom_" + Date.now();
    const order = Object.keys(allInventory).length + 1;

    allInventory[newId] = {
        id: newId,
        emoji,
        name,
        cost,
        stock,
        initialStock: stock,
        order
    };

    emojiInput.value = "";
    nameInput.value = "";
    costInput.value = "";
    stockInput.value = "";
    toggleNewItemForm(false);
    persistSingleInventoryItem(newId);
}

function deleteInventoryItem(itemId) {
    const item = allInventory[itemId];
    if (!item) return;
    if (confirm(`¿Eliminar "${item.name}" del catálogo de inventario?`)) {
        delete allInventory[itemId];
        persistSingleInventoryItem(itemId);
    }
}

function resetInventoryToDefault() {
    const envName = isSandboxMode ? "MODO PRUEBAS (Sandbox)" : "PRODUCCIÓN";
    if (confirm(`🔄 [${envName}] ¿Restaurar el inventario completo a las 220 unidades originales de los 18 artículos con los precios recomendados?`)) {
        allInventory = cloneDeep(DEFAULT_INVENTORY);
        persistInventoryState();
        alert("✅ Inventario restaurado a 220 unidades exitosamente.");
    }
}

// ==========================================
// GESTIÓN DE JUGADORES EN TIEMPO REAL
// ==========================================
function listenToPlayers() {
    if (currentPlayersRef) {
        currentPlayersRef.off("value");
        currentPlayersRef = null;
    }

    if (isSandboxMode) {
        const localPlayers = getLocalSandboxPlayers();
        if (localPlayers && Object.keys(localPlayers).length > 0) {
            allPlayers = extractCleanPlayers(localPlayers);
            renderPlayersTable();
            if (selectedPlayerKey && allPlayers[selectedPlayerKey]) {
                selectPlayer(selectedPlayerKey, true);
            }
            return;
        }
        // Si estaba vacío, clonar de Producción
        cloneProdToSandbox(false);
        return;
    }

    currentPlayersRef = db.ref("players");
    currentPlayersRef.on("value", (snapshot) => {
        const warnEl = document.getElementById("firebasePermissionWarning");
        if (warnEl) warnEl.classList.add("hidden");

        const rawVal = snapshot.val() || {};
        // Si existe __inventory__ en el snapshot de players, sincronizar también el inventario
        if (rawVal.__inventory__) {
            const unwrappedInv = unwrapInventoryNode(rawVal.__inventory__);
            if (unwrappedInv && Object.keys(unwrappedInv).length > 0) {
                allInventory = unwrappedInv;
                saveLocalInventoryCache(false, allInventory);
                updateLiveInventoryBanner();
                renderRedeemableItems();
                renderInventoryManagerTable();
            }
        }

        const cleaned = extractCleanPlayers(rawVal);
        const serialized = JSON.stringify(cleaned);

        // Evitar re-renderizados innecesarios que interrumpan los clics del usuario en la tabla
        if (serialized !== lastPlayersSerialized) {
            lastPlayersSerialized = serialized;
            allPlayers = cleaned;
            renderPlayersTable();
            if (selectedPlayerKey && allPlayers[selectedPlayerKey]) {
                selectPlayer(selectedPlayerKey, true);
            }
        }
    }, (error) => {
        console.error("Error leyendo jugadores en Firebase:", error);
        if (error && String(error.code || error.message).includes("PERMISSION_DENIED")) {
            const warnEl = document.getElementById("firebasePermissionWarning");
            if (warnEl) warnEl.classList.remove("hidden");
        }
    });
}

function renderPlayersTable() {
    const tableBody = document.getElementById("playersTableBody");
    if (!tableBody) return;
    const countEl = document.getElementById("totalPlayersCount");
    const rawFilter = (document.getElementById("searchInput")?.value || "").trim();
    const filter = normalizeSearchText(rawFilter);

    const keys = Object.keys(allPlayers).sort((a, b) => {
        const netB = computePlayerLedger(allPlayers[b]).netCoins;
        const netA = computePlayerLedger(allPlayers[a]).netCoins;
        return netB - netA;
    });

    if (countEl) countEl.innerText = keys.length;

    if (keys.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="3" class="py-6 text-center text-gray-400 italic">Aún no hay invitados registrados.</td></tr>`;
        return;
    }

    let html = "";
    keys.forEach((key) => {
        const p = allPlayers[key];
        if (!p) return;
        const tag = String(p.gamerTag || key);
        const rName = p.realName && p.realName !== "Invitado No Registrado" ? String(p.realName) : "";
        const partyCode = p.partyId && p.partyId !== "general" ? String(p.partyId) : "";
        const guestKey = String(p.guestId || key);

        if (filter) {
            const matchesTag = normalizeSearchText(tag).includes(filter);
            const matchesName = rName && normalizeSearchText(rName).includes(filter);
            const matchesParty = partyCode && normalizeSearchText(partyCode).includes(filter);
            const matchesKey = normalizeSearchText(guestKey).includes(filter);
            if (!matchesTag && !matchesName && !matchesParty && !matchesKey) return;
        }

        const ledger = computePlayerLedger(p);
        const isSelected = key === selectedPlayerKey;
        const encodedKey = encodeURIComponent(key);

        html += `
            <tr data-player-key="${encodedKey}" onclick="selectPlayer(decodeURIComponent('${encodedKey}'))" class="cursor-pointer hover:bg-[#fcfaf7] transition ${isSelected ? 'bg-[#52582f]/10' : ''}">
                <td class="py-2 px-1.5 max-w-[140px] sm:max-w-[200px]">
                    <div class="font-bold text-gray-800 text-xs truncate">${tag}</div>
                    ${rName ? `<div class="text-[10px] text-gray-400 truncate">${rName}</div>` : ''}
                </td>
                <td class="py-2 px-1.5 text-right whitespace-nowrap">
                    <span class="font-monogram font-extrabold text-[#52582f] text-base">${ledger.netCoins.toLocaleString()} 🪙</span>
                </td>
                <td class="py-2 px-1.5 text-right whitespace-nowrap">
                    <button type="button" onclick="event.stopPropagation(); selectPlayer(decodeURIComponent('${encodedKey}'))" class="${isSelected ? 'bg-[#52582f] text-white' : 'bg-gray-100 hover:bg-[#52582f] hover:text-white text-gray-700'} font-bold px-2.5 py-1 rounded-lg text-[11px] transition">
                        ${isSelected ? '✓ Activo' : 'Elegir'}
                    </button>
                </td>
            </tr>
        `;
    });

    tableBody.innerHTML = html || `<tr><td colspan="3" class="py-6 text-center text-gray-400 italic">Sin resultados para '${rawFilter}'.</td></tr>`;
}

function filterPlayers() {
    renderPlayersTable();
}

function selectPlayer(key, skipTableReRender) {
    selectedPlayerKey = key;
    const p = allPlayers[key];
    if (!p) return;

    const noSelEl = document.getElementById("noSelectionState");
    if (noSelEl) noSelEl.classList.add("hidden");
    const selState = document.getElementById("selectionState");
    if (selState) {
        selState.classList.remove("hidden");
        selState.classList.add("flex");
    }

    const ledger = computePlayerLedger(p);

    const tagEl = document.getElementById("selectedTag");
    if (tagEl) tagEl.innerText = p.gamerTag || key;

    const rName = p.realName && p.realName !== "Invitado No Registrado"
        ? `${p.realName} • Pase: ${p.partyId || 'general'}`
        : `Pase: ${p.partyId || 'general'}`;
    const realNameEl = document.getElementById("selectedRealName");
    if (realNameEl) realNameEl.innerText = rName;

    const coinsEl = document.getElementById("selectedCoins");
    if (coinsEl) coinsEl.innerText = ledger.netCoins.toLocaleString() + " 🪙";

    const sumArcEl = document.getElementById("summaryArcadeCoins");
    if (sumArcEl) sumArcEl.innerText = "+" + ledger.arcadeCoins.toLocaleString();
    const sumActEl = document.getElementById("summaryActivityCoins");
    if (sumActEl) sumActEl.innerText = "+" + ledger.activityCoins.toLocaleString();
    const sumSpentEl = document.getElementById("summarySpentCoins");
    if (sumSpentEl) sumSpentEl.innerText = "-" + ledger.spentCoins.toLocaleString();
    const sumNetEl = document.getElementById("summaryNetCoins");
    if (sumNetEl) sumNetEl.innerText = ledger.netCoins.toLocaleString() + " 🪙";

    renderRedeemableItems();
    renderPlayerAuditLogs(p, ledger);
    if (!skipTableReRender) {
        renderPlayersTable();
        if (window.innerWidth < 1024) {
            const panel = document.getElementById("actionPanel");
            if (panel) panel.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }
}
window.selectPlayer = selectPlayer;
window.toggleNewItemForm = toggleNewItemForm;

// ==========================================
// RENDERIZADO DE OPCIONES DE CANJE EN VIVO
// ==========================================
function renderRedeemableItems() {
    const container = document.getElementById("redeemableItemsContainer");
    if (!container) return;

    const p = selectedPlayerKey ? allPlayers[selectedPlayerKey] : null;
    const playerNetCoins = p ? computePlayerLedger(p).netCoins : 0;
    const searchVal = normalizeSearchText(document.getElementById("redeemSearchInput")?.value || "");

    const availableItems = getSortedInventoryList().filter(item => {
        const stock = parseInt(item.stock) || 0;
        if (stock <= 0) return false;
        if (searchVal && !normalizeSearchText(item.name).includes(searchVal)) return false;
        return true;
    });

    if (availableItems.length === 0) {
        container.innerHTML = `
            <div class="col-span-2 py-4 text-center text-gray-400 italic text-xs">
                No hay artículos disponibles con ese filtro.
            </div>
        `;
        return;
    }

    let html = "";
    availableItems.forEach(item => {
        const cost = parseInt(item.cost) || 0;
        const stock = parseInt(item.stock) || 0;
        const canAfford = playerNetCoins >= cost;
        const missing = cost - playerNetCoins;

        const btnClass = canAfford
            ? "bg-white hover:bg-[#52582f]/5 active:scale-[0.99] border-gray-200 text-gray-800 cursor-pointer shadow-2xs"
            : "bg-gray-50/70 border-gray-200/60 text-gray-400 opacity-65 cursor-not-allowed";

        html += `
            <button type="button" ${canAfford ? `onclick="redeemInventoryItem('${item.id}')"` : "disabled"} class="w-full px-3 py-2 rounded-xl border text-left transition flex justify-between items-center gap-2 ${btnClass}">
                <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-1.5">
                        <span class="text-sm shrink-0">${item.emoji || '🎁'}</span>
                        <span class="font-bold text-xs truncate">${item.name}</span>
                    </div>
                    <div class="flex items-center gap-2 mt-0.5">
                        <span class="text-[10px] text-gray-400 font-semibold">Disp: ${stock}</span>
                        <span class="font-monogram text-sm font-extrabold ${canAfford ? 'text-[#52582f]' : 'text-gray-400'}">-${cost.toLocaleString()} 🪙</span>
                    </div>
                </div>
                <div class="shrink-0 text-right">
                    ${canAfford
                        ? `<span class="bg-[#52582f] text-white font-bold px-2.5 py-1 rounded-lg text-[11px]">Canjear</span>`
                        : `<span class="text-[10px] font-semibold text-gray-400 block">Faltan ${missing.toLocaleString()}</span>`
                    }
                </div>
            </button>
        `;
    });

    container.innerHTML = html;
}

// ==========================================
// RENDERIZADO DE LA BITÁCORA / LOG DEL JUGADOR
// ==========================================
function renderPlayerAuditLogs(p, ledger) {
    const arcadeListEl = document.getElementById("logArcadeList");
    const activitiesListEl = document.getElementById("logActivitiesList");
    const redemptionsListEl = document.getElementById("logRedemptionsList");

    const scores = p.scores || {};

    // 1. LOG DE ARCADE
    const arcadeGames = [
        { key: "chico", icon: "🦖", label: "Chicosaurio", score: scores.chico || 0, unit: "pts", coins: ledger.gameCoins.chico },
        { key: "chica", icon: "👰🏻‍♀️", label: "Atrapa el Amor", score: scores.chica || 0, unit: "pts", coins: ledger.gameCoins.chica },
        { key: "maddie", icon: "🐶", label: "Atrapa a Maddie", score: scores.maddie || 0, unit: "clics", coins: ledger.gameCoins.maddie },
        { key: "puebla", icon: "🚗", label: "Camino a Puebla", score: scores.puebla || 0, unit: "pts", coins: ledger.gameCoins.puebla }
    ];

    let arcadeHtml = "";
    arcadeGames.forEach(g => {
        arcadeHtml += `
            <div class="flex justify-between items-center py-1">
                <span class="truncate pr-2">${g.icon} <span class="font-semibold">${g.label}</span> <span class="text-gray-400 text-[11px]">(${g.score} ${g.unit})</span></span>
                <span class="font-monogram font-bold text-sm shrink-0 ${g.coins > 0 ? 'text-[#52582f]' : 'text-gray-400'}">+${g.coins.toLocaleString()}</span>
            </div>
        `;
    });

    arcadeHtml += `
        <div class="flex justify-between items-center py-1 ${ledger.hasAllMetasBonus ? 'text-[#52582f]' : 'text-gray-400'}">
            <span class="font-bold">🏆 Bono 4 Metas</span>
            <span class="font-monogram font-bold text-sm shrink-0">${ledger.hasAllMetasBonus ? '+500' : '+0'}</span>
        </div>
    `;
    if (arcadeListEl) arcadeListEl.innerHTML = arcadeHtml;

    // 2. LOG DE ACTIVIDADES FÍSICAS
    if (activitiesListEl) {
        if (ledger.activityLogsList.length === 0) {
            activitiesListEl.innerHTML = `<p class="text-gray-400 italic py-1 text-[11px]">Sin registros en actividades.</p>`;
        } else {
            activitiesListEl.innerHTML = ledger.activityLogsList.map(entry => {
                const icon = entry.type === "plinko" ? "🎯" : (entry.type === "yahtzee" ? "🎲" : "✨");
                const timeStr = formatTimeShort(entry.timestamp);
                return `
                    <div class="flex justify-between items-center py-1.5 gap-2">
                        <div class="min-w-0 flex-1 truncate">
                            <span class="font-semibold text-gray-800">${icon} ${entry.label || 'Actividad'}</span>
                            ${timeStr ? `<span class="text-[10px] text-gray-400 ml-1">${timeStr}</span>` : ''}
                        </div>
                        <div class="flex items-center gap-1.5 shrink-0">
                            <span class="font-monogram font-bold text-sm text-[#52582f]">+${(parseInt(entry.amount) || 0).toLocaleString()}</span>
                            <button onclick="revertActivityLog('${entry.key}')" class="text-[10px] bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 border border-gray-200 px-2 py-0.5 rounded-lg transition font-semibold">
                                ↩️ Revertir
                            </button>
                        </div>
                    </div>
                `;
            }).join("");
        }
    }

    // 3. LOG DE CANJES EN TIENDA
    if (redemptionsListEl) {
        if (ledger.redemptionLogsList.length === 0) {
            redemptionsListEl.innerHTML = `<p class="text-gray-400 italic py-1 text-[11px]">Sin artículos canjeados aún.</p>`;
        } else {
            redemptionsListEl.innerHTML = ledger.redemptionLogsList.map(entry => {
                const timeStr = formatTimeShort(entry.timestamp);
                return `
                    <div class="flex justify-between items-center py-1.5 gap-2">
                        <div class="min-w-0 flex-1 truncate">
                            <span class="font-semibold text-gray-800">${entry.emoji || '🛍️'} ${entry.itemName}</span>
                            ${timeStr ? `<span class="text-[10px] text-gray-400 ml-1">${timeStr}</span>` : ''}
                        </div>
                        <div class="flex items-center gap-1.5 shrink-0">
                            <span class="font-monogram font-bold text-sm text-rose-700">-${(parseInt(entry.cost) || 0).toLocaleString()}</span>
                            <button onclick="revertRedemptionLog('${entry.key}')" class="text-[10px] bg-gray-100 hover:bg-amber-50 text-gray-600 hover:text-amber-800 border border-gray-200 px-2 py-0.5 rounded-lg transition font-semibold">
                                ↩️ Devolver
                            </button>
                        </div>
                    </div>
                `;
            }).join("");
        }
    }
}

// ==========================================
// OPERACIONES TRANSACCIONALES (ACTIVIDADES Y CANJES)
// ==========================================
function commitPlayerUpdate(playerKey, mutatorFn) {
    const p = allPlayers[playerKey];
    if (!p) return Promise.resolve();

    mutatorFn(p);
    const ledger = computePlayerLedger(p);
    p.arcadeCoins = ledger.arcadeCoins;
    p.activityCoins = ledger.activityCoins;
    p.spentCoins = ledger.spentCoins;
    p.adminBonus = ledger.activityCoins - ledger.spentCoins;
    p.bonusCoins = ledger.activityCoins - ledger.spentCoins;
    p.totalChiCoins = ledger.netCoins;
    p.lastUpdated = Date.now();

    if (isSandboxMode) {
        saveLocalSandboxPlayers(allPlayers);
        selectPlayer(playerKey, false);
        return Promise.resolve();
    }

    selectPlayer(playerKey, false);
    return db.ref(`players/${playerKey}`).update({
        activityLogs: p.activityLogs || null,
        redemptionLogs: p.redemptionLogs || null,
        arcadeCoins: p.arcadeCoins,
        activityCoins: p.activityCoins,
        spentCoins: p.spentCoins,
        adminBonus: p.adminBonus,
        bonusCoins: p.bonusCoins,
        totalChiCoins: p.totalChiCoins,
        lastUpdated: firebase.database.ServerValue.TIMESTAMP
    }).catch(err => {
        alert("Error al sincronizar con Firebase: " + err.message);
    });
}

function addActivityPoints(type, defaultLabel, amount) {
    if (!selectedPlayerKey) return;
    const cleanAmount = parseInt(amount);
    if (isNaN(cleanAmount) || cleanAmount <= 0) return;

    const logId = "act_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
    const entry = {
        id: logId,
        type: type || "bonus",
        label: defaultLabel || "Actividad",
        amount: cleanAmount,
        timestamp: Date.now()
    };

    commitPlayerUpdate(selectedPlayerKey, (p) => {
        if (!p.activityLogs || typeof p.activityLogs !== "object") p.activityLogs = {};
        p.activityLogs[logId] = entry;
    });
}

function applyCustomActivity() {
    if (!selectedPlayerKey) return;
    const typeSelect = document.getElementById("customActivityType");
    const noteInput = document.getElementById("customActivityNote");
    const amountInput = document.getElementById("customAmountInput");

    const type = typeSelect.value;
    const customNote = (noteInput.value || "").trim();
    const amount = parseInt(amountInput.value);

    if (isNaN(amount) || amount <= 0) {
        alert("Ingresa una cantidad positiva de ChiCoins.");
        return;
    }

    let baseLabel = "Premio";
    if (type === "plinko") baseLabel = "Plinko";
    else if (type === "yahtzee") baseLabel = "Yahtzee";

    const finalLabel = customNote ? `${baseLabel}: ${customNote}` : baseLabel;

    addActivityPoints(type, finalLabel, amount);
    noteInput.value = "";
    amountInput.value = "";
}

function redeemInventoryItem(itemId) {
    if (!selectedPlayerKey || isRedeeming) return;
    const targetPlayerKey = selectedPlayerKey;
    const p = allPlayers[targetPlayerKey];
    const item = allInventory[itemId];
    if (!p || !item) return;

    const cost = parseInt(item.cost) || 0;
    const currentStock = parseInt(item.stock) || 0;
    const ledger = computePlayerLedger(p);

    if (currentStock <= 0) {
        alert(`⚠️ "${item.name}" ya se agotó.`);
        return;
    }
    if (ledger.netCoins < cost) {
        alert(`❌ Saldo insuficiente: ${p.gamerTag} tiene ${ledger.netCoins.toLocaleString()} 🪙 y "${item.name}" cuesta ${cost.toLocaleString()} 🪙.`);
        return;
    }

    isRedeeming = true;

    const finalizePlayerRedemption = () => {
        const logId = "red_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
        const redemptionEntry = {
            id: logId,
            itemId: itemId,
            itemName: item.name,
            emoji: item.emoji || "🛍️",
            cost: cost,
            timestamp: Date.now()
        };

        return commitPlayerUpdate(targetPlayerKey, (playerObj) => {
            if (!playerObj.redemptionLogs || typeof playerObj.redemptionLogs !== "object") playerObj.redemptionLogs = {};
            playerObj.redemptionLogs[logId] = redemptionEntry;
        });
    };

    if (isSandboxMode) {
        item.stock = Math.max(0, currentStock - 1);
        refreshInventoryUI();
        finalizePlayerRedemption().finally(() => {
            isRedeeming = false;
        });
        return;
    }

    // En Producción: descontar 1 unidad de forma atómica sobre el artículo específico
    item.stock = Math.max(0, currentStock - 1);
    refreshInventoryUI();

    db.ref(`players/__inventory__/items/${itemId}`).transaction((serverItem) => {
        if (!serverItem) {
            return { ...item, stock: Math.max(0, currentStock - 1) };
        }
        const srvStock = parseInt(serverItem.stock) || 0;
        if (srvStock <= 0) {
            return; // Aborta la transacción si otro celular del staff agotó la última unidad
        }
        serverItem.stock = srvStock - 1;
        return serverItem;
    }, (error, committed, snapshot) => {
        if (error || !committed) {
            if (snapshot && snapshot.val()) {
                allInventory[itemId] = snapshot.val();
            } else {
                item.stock = 0;
            }
            refreshInventoryUI();
            isRedeeming = false;
            alert(`⚠️ "${item.name}" acaba de agotarse en otro dispositivo.`);
            return;
        }

        if (snapshot && snapshot.val()) {
            allInventory[itemId] = snapshot.val();
            refreshInventoryUI();
        }
        db.ref("players/__inventory__/lastUpdated").set(Date.now()).catch(() => {});

        finalizePlayerRedemption().finally(() => {
            isRedeeming = false;
        });
    });
}

function revertActivityLog(logKey) {
    if (!selectedPlayerKey) return;
    const p = allPlayers[selectedPlayerKey];
    const entry = p?.activityLogs?.[logKey];
    if (!entry) return;

    if (confirm(`¿Revertir el abono de "${entry.label}" (+${entry.amount} 🪙)?`)) {
        commitPlayerUpdate(selectedPlayerKey, (playerObj) => {
            if (playerObj.activityLogs) {
                delete playerObj.activityLogs[logKey];
            }
        });
    }
}

function revertRedemptionLog(logKey) {
    if (!selectedPlayerKey) return;
    const p = allPlayers[selectedPlayerKey];
    const entry = p?.redemptionLogs?.[logKey];
    if (!entry) return;

    if (confirm(`¿Devolver "${entry.itemName}" al inventario (+1 ud) y reembolsar +${entry.cost.toLocaleString()} 🪙 a ${p.gamerTag}?`)) {
        if (entry.itemId && allInventory[entry.itemId]) {
            adjustInventoryItemStock(entry.itemId, 1);
        }
        commitPlayerUpdate(selectedPlayerKey, (playerObj) => {
            if (playerObj.redemptionLogs) {
                delete playerObj.redemptionLogs[logKey];
            }
        });
    }
}

// ==========================================
// ZONA DE PELIGRO, LIMPIEZA SEGURA & BACKUPS
// ==========================================
async function cleanOnlyActivitiesAndRedemptions() {
    const envName = isSandboxMode ? "MODO PRUEBAS (Sandbox)" : "PRODUCCIÓN";
    if (!confirm(`🧼 [${envName}] ¿Deseas limpiar ÚNICAMENTE las pruebas de Canjes y Actividades (Plinko/Yahtzee) y regresar el inventario a 220 unidades?\n\n✅ Todos los récords y ChiCoins de Arcade ganados por los invitados se mantendrán 100% intactos.`)) {
        return;
    }

    try {
        allInventory = cloneDeep(DEFAULT_INVENTORY);
        persistInventoryState();

        const keys = Object.keys(allPlayers || {});
        for (const key of keys) {
            if (key.startsWith("__")) continue;
            const p = allPlayers[key];
            if (!p) continue;
            p.activityLogs = null;
            p.redemptionLogs = null;
            p.activityCoins = 0;
            p.spentCoins = 0;
            p.adminBonus = 0;
            p.bonusCoins = 0;
            const ledger = computePlayerLedger(p);
            p.arcadeCoins = ledger.arcadeCoins;
            p.totalChiCoins = ledger.arcadeCoins;

            if (!isSandboxMode) {
                await db.ref(`players/${key}`).update({
                    activityLogs: null,
                    redemptionLogs: null,
                    activityCoins: 0,
                    spentCoins: 0,
                    adminBonus: 0,
                    bonusCoins: 0,
                    arcadeCoins: ledger.arcadeCoins,
                    totalChiCoins: ledger.arcadeCoins
                });
            }
        }

        if (isSandboxMode) {
            saveLocalSandboxPlayers(allPlayers);
        }

        renderPlayersTable();
        if (selectedPlayerKey && allPlayers[selectedPlayerKey]) {
            selectPlayer(selectedPlayerKey, true);
        }

        alert(`✅ Listo (${envName}): Inventario restaurado a 220 unidades y pruebas de actividades/canjes limpiadas. Todos los récords de Arcade siguen intactos.`);
    } catch (err) {
        alert("Error al limpiar actividades y canjes: " + err.message);
    }
}

function resetPlayerStats() {
    if (!selectedPlayerKey) return;
    const p = allPlayers[selectedPlayerKey];
    const tag = p.gamerTag || selectedPlayerKey;

    if (confirm(`⚠️ ¿Estás SEGURO de querer REINICIAR A CEROS todos los puntos, actividades y canjes de ${tag}?`)) {
        p.scores = { chico: 0, chica: 0, maddie: 0, puebla: 0 };
        p.chiCoins = { chico: 0, chica: 0, maddie: 0, puebla: 0 };
        p.arcadeCoins = 0;
        p.activityCoins = 0;
        p.spentCoins = 0;
        p.activityLogs = null;
        p.redemptionLogs = null;
        p.bonusCoins = 0;
        p.adminBonus = 0;
        p.totalChiCoins = 0;
        p.totalScore = 0;
        p.timePlayedSeconds = 0;

        if (isSandboxMode) {
            saveLocalSandboxPlayers(allPlayers);
            selectPlayer(selectedPlayerKey, false);
            return;
        }

        db.ref(`players/${selectedPlayerKey}`).update({
            scores: { chico: 0, chica: 0, maddie: 0, puebla: 0 },
            chiCoins: { chico: 0, chica: 0, maddie: 0, puebla: 0 },
            arcadeCoins: 0,
            activityCoins: 0,
            spentCoins: 0,
            activityLogs: null,
            redemptionLogs: null,
            bonusCoins: 0,
            adminBonus: 0,
            totalChiCoins: 0,
            totalScore: 0,
            timePlayedSeconds: 0,
            lastUpdated: firebase.database.ServerValue.TIMESTAMP
        }).then(() => {
            selectPlayer(selectedPlayerKey, false);
        }).catch(err => alert("Error: " + err.message));
    }
}

function deletePlayerRecord() {
    if (!selectedPlayerKey) return;
    const p = allPlayers[selectedPlayerKey];
    const tag = p.gamerTag || selectedPlayerKey;

    if (confirm(`🚨 ¿Borrar por completo el registro de ${tag}?`)) {
        const keyToDelete = selectedPlayerKey;
        delete allPlayers[keyToDelete];
        selectedPlayerKey = null;

        document.getElementById("noSelectionState").classList.remove("hidden");
        document.getElementById("selectionState").classList.add("hidden");
        document.getElementById("selectionState").classList.remove("flex");
        renderPlayersTable();

        if (isSandboxMode) {
            saveLocalSandboxPlayers(allPlayers);
            return;
        }

        db.ref(`players/${keyToDelete}`).remove().catch(err => alert("Error al borrar: " + err.message));
    }
}

async function wipeEntireDatabase() {
    const envName = isSandboxMode ? "MODO PRUEBAS (Sandbox)" : "PRODUCCIÓN";
    const pass = prompt(`🚨 ATENCIÓN [${envName}] 🚨\n\nEstás a punto de BORRAR TODOS LOS JUGADORES de ${envName}.\nEscribe 'Chicos0212' para confirmar:`);
    if (pass === "Chicos0212") {
        if (confirm(`¿Estás absolutamente seguro de borrar todos los jugadores de ${envName}?`)) {
            if (isSandboxMode) {
                allPlayers = {};
                saveLocalSandboxPlayers({});
                selectedPlayerKey = null;
                document.getElementById("noSelectionState").classList.remove("hidden");
                document.getElementById("selectionState").classList.add("hidden");
                document.getElementById("selectionState").classList.remove("flex");
                renderPlayersTable();
                alert("✅ Jugadores de Pruebas (Sandbox) eliminados.");
                return;
            }

            try {
                const keys = Object.keys(allPlayers || {});
                for (const k of keys) {
                    if (!k.startsWith("__")) {
                        await db.ref(`players/${k}`).remove();
                    }
                }
                alert(`✅ Todos los jugadores de ${envName} fueron eliminados.`);
                document.getElementById("noSelectionState").classList.remove("hidden");
                document.getElementById("selectionState").classList.add("hidden");
                document.getElementById("selectionState").classList.remove("flex");
                selectedPlayerKey = null;
            } catch (err) {
                alert("❌ Error al borrar: " + err.message);
            }
        }
    } else if (pass !== null) {
        alert("❌ Contraseña incorrecta.");
    }
}

function downloadBackupJSON() {
    const envTag = isSandboxMode ? "sandbox" : "produccion";
    const backupPayload = {
        environment: envTag,
        timestamp: new Date().toISOString(),
        players: allPlayers || {},
        inventory: allInventory || {}
    };
    const dateStr = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupPayload, null, 2));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `backup-boda-${envTag}-${dateStr}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
}

function restoreBackupJSON(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const parsed = JSON.parse(e.target.result);
            if (!parsed || typeof parsed !== "object") {
                alert("❌ Archivo inválido.");
                return;
            }
            const hasStructuredBackup = parsed.players || parsed.inventory;
            const rawPlayersToRestore = hasStructuredBackup ? (parsed.players || {}) : parsed;
            const playersToRestore = extractCleanPlayers(rawPlayersToRestore);
            const inventoryToRestore = hasStructuredBackup ? (parsed.inventory || null) : unwrapInventoryNode(rawPlayersToRestore.__inventory__);

            const count = Object.keys(playersToRestore).length;
            const envName = isSandboxMode ? "MODO PRUEBAS (Sandbox)" : "PRODUCCIÓN";
            if (!confirm(`⚠️ [${envName}] ¿Deseas RESTAURAR ${count} jugadores${inventoryToRestore ? ' y el inventario' : ''} en ${envName}?`)) {
                event.target.value = "";
                return;
            }

            if (inventoryToRestore) {
                allInventory = inventoryToRestore;
                persistInventoryState();
            }

            if (isSandboxMode) {
                allPlayers = playersToRestore;
                saveLocalSandboxPlayers(allPlayers);
                renderPlayersTable();
                alert(`✅ ¡Respaldo restaurado exitosamente en ${envName}!`);
                return;
            }

            for (const k of Object.keys(playersToRestore)) {
                await db.ref(`players/${k}`).set(playersToRestore[k]);
            }
            alert(`✅ ¡Respaldo restaurado exitosamente en ${envName}!`);
        } catch (err) {
            alert("❌ Error al restaurar el archivo JSON: " + err.message);
        } finally {
            event.target.value = "";
        }
    };
    reader.readAsText(file);
}
