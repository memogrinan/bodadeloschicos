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

// CATÁLOGO INICIAL OFICIAL DE LA TIENDA (20 VARIANTES = 250 ARTÍCULOS TOTALES)
const DEFAULT_INVENTORY = {
    item_01_pantunflas_t5: {
        id: "item_01_pantunflas_t5",
        emoji: "🥿",
        name: "Pantunflas Moño Verde Esmeralda (Talla 5)",
        cost: 2000,
        stock: 15,
        initialStock: 15,
        order: 1
    },
    item_02_pantunflas_t7: {
        id: "item_02_pantunflas_t7",
        emoji: "🥿",
        name: "Pantunflas Moño Verde Esmeralda (Talla 7)",
        cost: 2000,
        stock: 15,
        initialStock: 15,
        order: 2
    },
    item_03_sudadera_m: {
        id: "item_03_sudadera_m",
        emoji: "🧥",
        name: "Sudadera (Talla M)",
        cost: 4500,
        stock: 10,
        initialStock: 10,
        order: 3
    },
    item_04_sudadera_l: {
        id: "item_04_sudadera_l",
        emoji: "🧥",
        name: "Sudadera (Talla L)",
        cost: 4500,
        stock: 10,
        initialStock: 10,
        order: 4
    },
    item_05_sudadera_xl: {
        id: "item_05_sudadera_xl",
        emoji: "🧥",
        name: "Sudadera (Talla XL)",
        cost: 4500,
        stock: 10,
        initialStock: 10,
        order: 5
    },
    item_06_set_vino: {
        id: "item_06_set_vino",
        emoji: "🍷",
        name: "Set de Vino Caja de Madera",
        cost: 3500,
        stock: 10,
        initialStock: 10,
        order: 6
    },
    item_07_destapador_snap: {
        id: "item_07_destapador_snap",
        emoji: "🍾",
        name: "Destapador Snap",
        cost: 1200,
        stock: 10,
        initialStock: 10,
        order: 7
    },
    item_08_cosmetiquera_negra: {
        id: "item_08_cosmetiquera_negra",
        emoji: "🖤",
        name: "Cosmetiquera Grande Negra",
        cost: 2500,
        stock: 10,
        initialStock: 10,
        order: 8
    },
    item_09_cosmetiquera_blanca: {
        id: "item_09_cosmetiquera_blanca",
        emoji: "🤍",
        name: "Cosmetiquera Rectangular Chica Blanca",
        cost: 2000,
        stock: 10,
        initialStock: 10,
        order: 9
    },
    item_10_bolsa_yute: {
        id: "item_10_bolsa_yute",
        emoji: "👜",
        name: "Bolsa de Yute Mayan",
        cost: 2200,
        stock: 10,
        initialStock: 10,
        order: 10
    },
    item_11_taza_negro_matte: {
        id: "item_11_taza_negro_matte",
        emoji: "☕",
        name: "Taza Negro Matte Grabada",
        cost: 2500,
        stock: 15,
        initialStock: 15,
        order: 11
    },
    item_12_chalina: {
        id: "item_12_chalina",
        emoji: "🧣",
        name: "Chalina",
        cost: 2200,
        stock: 10,
        initialStock: 10,
        order: 12
    },
    item_13_vaso_cervecero: {
        id: "item_13_vaso_cervecero",
        emoji: "🍺",
        name: "Vaso Cervecero",
        cost: 2000,
        stock: 15,
        initialStock: 15,
        order: 13
    },
    item_14_porta_vasos: {
        id: "item_14_porta_vasos",
        emoji: "🥃",
        name: "Porta Vasos Porso",
        cost: 1500,
        stock: 10,
        initialStock: 10,
        order: 14
    },
    item_15_destapador_opener: {
        id: "item_15_destapador_opener",
        emoji: "🍺",
        name: "Destapador Opener",
        cost: 1000,
        stock: 15,
        initialStock: 15,
        order: 15
    },
    item_16_juego_flop: {
        id: "item_16_juego_flop",
        emoji: "🎯",
        name: "Juego Flop",
        cost: 1800,
        stock: 10,
        initialStock: 10,
        order: 16
    },
    item_17_tote_bag: {
        id: "item_17_tote_bag",
        emoji: "🛍️",
        name: "Tote Bag",
        cost: 1500,
        stock: 30,
        initialStock: 30,
        order: 17
    },
    item_18_libreta_lamba: {
        id: "item_18_libreta_lamba",
        emoji: "📓",
        name: "Libreta Lamba",
        cost: 1500,
        stock: 10,
        initialStock: 10,
        order: 18
    },
    item_19_barber_neceser: {
        id: "item_19_barber_neceser",
        emoji: "💈",
        name: "Barber Neceser",
        cost: 2500,
        stock: 15,
        initialStock: 15,
        order: 19
    },
    item_20_auch: {
        id: "item_20_auch",
        emoji: "🩹",
        name: "Auch",
        cost: 1000,
        stock: 10,
        initialStock: 10,
        order: 20
    }
};

let allPlayers = {};
let allInventory = {};
let selectedPlayerKey = null;
let isRedeeming = false;

document.addEventListener("DOMContentLoaded", () => {
    checkAdminAuth();
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

    // Compatibilidad retroactiva si existía un adminBonus previo sin logs detallados
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
function listenToInventory() {
    db.ref("inventory").on("value", (snapshot) => {
        const val = snapshot.val();
        if (!val || Object.keys(val).length === 0) {
            // Inicializar automáticamente con los 250 artículos por defecto si no existe
            db.ref("inventory").set(DEFAULT_INVENTORY);
            return;
        }
        allInventory = val;
        updateLiveInventoryBanner();
        renderRedeemableItems();
        renderInventoryManagerTable();
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
    if (initEl) initEl.innerText = `/ ${totalInitial.toLocaleString()} uds (${items.length} productos)`;

    if (badgeEl && countEl) {
        if (outOfStockCount > 0) {
            countEl.innerText = outOfStockCount;
            badgeEl.classList.remove("hidden");
        } else {
            badgeEl.classList.add("hidden");
        }
    }
}

function toggleInventoryModal() {
    const modal = document.getElementById("inventoryModal");
    if (!modal) return;
    if (modal.classList.contains("hidden")) {
        modal.classList.remove("hidden");
        modal.classList.add("flex");
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
        tbody.innerHTML = `<tr><td colspan="4" class="py-6 text-center text-slate-500 italic">No hay artículos en el inventario.</td></tr>`;
        return;
    }

    let html = "";
    items.forEach(item => {
        const stock = Math.max(0, parseInt(item.stock) || 0);
        const init = Math.max(stock, parseInt(item.initialStock) || stock);
        const cost = parseInt(item.cost) || 0;
        const isOut = stock === 0;
        const isLow = stock > 0 && stock <= 3;

        let stockBadgeClass = "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
        if (isOut) stockBadgeClass = "bg-red-500/20 text-red-400 border-red-500/40";
        else if (isLow) stockBadgeClass = "bg-amber-500/20 text-amber-300 border-amber-500/40";

        html += `
            <tr class="hover:bg-slate-700/30 transition ${isOut ? 'opacity-60' : ''}">
                <td class="py-2.5 px-2">
                    <div class="flex items-center gap-2">
                        <span class="text-lg">${item.emoji || '🎁'}</span>
                        <div>
                            <span class="font-bold text-slate-100">${item.name}</span>
                            ${isOut ? `<span class="ml-2 text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full font-extrabold uppercase">Agotado</span>` : ''}
                        </div>
                    </div>
                </td>
                <td class="py-2.5 px-2 text-center">
                    <div class="inline-flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1">
                        <input type="number" value="${cost}" onchange="updateInventoryItemCost('${item.id}', this.value)" class="w-20 bg-transparent text-amber-400 font-mono font-bold text-center outline-none text-xs">
                        <span class="text-[11px]">🪙</span>
                    </div>
                </td>
                <td class="py-2.5 px-2 text-center">
                    <span class="inline-block px-2.5 py-1 rounded-lg border font-mono font-bold text-xs ${stockBadgeClass}">
                        ${stock} / ${init}
                    </span>
                </td>
                <td class="py-2.5 px-2 text-right">
                    <div class="inline-flex items-center gap-1">
                        <button onclick="adjustInventoryItemStock('${item.id}', -1)" class="bg-slate-700 hover:bg-slate-600 text-white font-bold w-7 h-7 rounded-lg text-xs transition" title="Restar 1">-1</button>
                        <button onclick="adjustInventoryItemStock('${item.id}', 1)" class="bg-slate-700 hover:bg-slate-600 text-white font-bold w-7 h-7 rounded-lg text-xs transition" title="Sumar 1">+1</button>
                        <button onclick="deleteInventoryItem('${item.id}')" class="bg-red-500/20 hover:bg-red-500/40 text-red-400 font-bold w-7 h-7 rounded-lg text-xs transition ml-1" title="Eliminar artículo">🗑️</button>
                    </div>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

function updateInventoryItemCost(itemId, newCostVal) {
    const cost = Math.max(0, parseInt(newCostVal) || 0);
    db.ref(`inventory/${itemId}`).update({ cost });
}

function adjustInventoryItemStock(itemId, delta) {
    const item = allInventory[itemId];
    if (!item) return;
    const currentStock = parseInt(item.stock) || 0;
    const newStock = Math.max(0, currentStock + delta);
    const currentInit = parseInt(item.initialStock) || currentStock;
    const newInit = Math.max(currentInit, newStock);
    db.ref(`inventory/${itemId}`).update({
        stock: newStock,
        initialStock: newInit
    });
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

    db.ref("inventory/" + newId).set({
        id: newId,
        emoji,
        name,
        cost,
        stock,
        initialStock: stock,
        order
    }).then(() => {
        emojiInput.value = "";
        nameInput.value = "";
        costInput.value = "";
        stockInput.value = "";
    }).catch(err => alert("Error al guardar artículo: " + err.message));
}

function deleteInventoryItem(itemId) {
    const item = allInventory[itemId];
    if (!item) return;
    if (confirm(`¿Eliminar "${item.name}" del catálogo de inventario?`)) {
        db.ref(`inventory/${itemId}`).remove();
    }
}

function resetInventoryToDefault() {
    if (confirm("🔄 ¿Restaurar el inventario completo a las 250 unidades originales de los 20 artículos?")) {
        db.ref("inventory").set(DEFAULT_INVENTORY).then(() => {
            alert("✅ Inventario restaurado a 250 unidades exitosamente.");
        });
    }
}

// ==========================================
// GESTIÓN DE JUGADORES EN TIEMPO REAL
// ==========================================
function listenToPlayers() {
    db.ref("players").on("value", (snapshot) => {
        allPlayers = snapshot.val() || {};
        renderPlayersTable();
        if (selectedPlayerKey && allPlayers[selectedPlayerKey]) {
            selectPlayer(selectedPlayerKey);
        }
    });
}

function renderPlayersTable() {
    const tableBody = document.getElementById("playersTableBody");
    const countEl = document.getElementById("totalPlayersCount");
    const filter = (document.getElementById("searchInput")?.value || "").toLowerCase().trim();

    const keys = Object.keys(allPlayers).sort((a, b) => {
        const netB = computePlayerLedger(allPlayers[b]).netCoins;
        const netA = computePlayerLedger(allPlayers[a]).netCoins;
        return netB - netA;
    });

    if (countEl) countEl.innerText = keys.length;

    if (keys.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="3" class="py-8 text-center text-slate-500 italic">Aún no hay jugadores registrados en el Arcade.</td></tr>`;
        return;
    }

    let html = "";
    keys.forEach((key) => {
        const p = allPlayers[key];
        const tag = p.gamerTag || key;
        const rName = p.realName && p.realName !== "Invitado No Registrado" ? p.realName : "";

        if (filter && !tag.toLowerCase().includes(filter) && !(rName && rName.toLowerCase().includes(filter))) return;

        const ledger = computePlayerLedger(p);
        const isSelected = key === selectedPlayerKey;

        html += `
            <tr onclick="selectPlayer('${key}')" class="cursor-pointer hover:bg-slate-700/40 transition ${isSelected ? 'bg-amber-500/15 border-l-4 border-amber-400' : ''}">
                <td class="py-2.5 px-2">
                    <div class="font-bold text-slate-100 text-sm">${tag}</div>
                    ${rName ? `<div class="text-[11px] text-slate-400">${rName}</div>` : ''}
                </td>
                <td class="py-2.5 px-2 text-right font-mono font-bold text-amber-400 text-sm">
                    ${ledger.netCoins.toLocaleString()} 🪙
                    ${ledger.spentCoins > 0 ? `<div class="text-[10px] text-rose-400 font-normal">Canjeó: -${ledger.spentCoins.toLocaleString()}</div>` : ''}
                </td>
                <td class="py-2.5 px-2 text-right">
                    <button type="button" class="${isSelected ? 'bg-amber-400 text-slate-950' : 'bg-slate-700 hover:bg-amber-500 hover:text-slate-950 text-slate-200'} font-bold px-3 py-1.5 rounded-xl text-xs transition shadow">
                        ${isSelected ? 'Activo ✓' : 'Elegir'}
                    </button>
                </td>
            </tr>
        `;
    });

    tableBody.innerHTML = html || `<tr><td colspan="3" class="py-8 text-center text-slate-500 italic">No se encontraron jugadores con '${filter}'.</td></tr>`;
}

function filterPlayers() {
    renderPlayersTable();
}

function selectPlayer(key) {
    selectedPlayerKey = key;
    const p = allPlayers[key];
    if (!p) return;

    document.getElementById("noSelectionState").classList.add("hidden");
    const selState = document.getElementById("selectionState");
    selState.classList.remove("hidden");
    selState.classList.add("flex");

    const ledger = computePlayerLedger(p);

    document.getElementById("selectedTag").innerText = p.gamerTag || key;
    const rName = p.realName && p.realName !== "Invitado No Registrado" ? `👤 ${p.realName} (Invitación: ${p.partyId || 'general'})` : `Invitación: ${p.partyId || 'general'}`;
    document.getElementById("selectedRealName").innerText = rName;
    document.getElementById("selectedCoins").innerText = ledger.netCoins.toLocaleString() + " 🪙";

    // Actualizar las 4 tarjetas resumen
    document.getElementById("summaryArcadeCoins").innerText = "+" + ledger.arcadeCoins.toLocaleString() + " 🪙";
    document.getElementById("summaryActivityCoins").innerText = "+" + ledger.activityCoins.toLocaleString() + " 🪙";
    document.getElementById("summarySpentCoins").innerText = "-" + ledger.spentCoins.toLocaleString() + " 🪙";
    document.getElementById("summaryNetCoins").innerText = ledger.netCoins.toLocaleString() + " 🪙";

    renderRedeemableItems();
    renderPlayerAuditLogs(p, ledger);
    renderPlayersTable();
}

// ==========================================
// RENDERIZADO DE OPCIONES DE CANJE EN VIVO
// ==========================================
function renderRedeemableItems() {
    const container = document.getElementById("redeemableItemsContainer");
    if (!container) return;

    const p = selectedPlayerKey ? allPlayers[selectedPlayerKey] : null;
    const playerNetCoins = p ? computePlayerLedger(p).netCoins : 0;
    const searchVal = (document.getElementById("redeemSearchInput")?.value || "").toLowerCase().trim();

    // Filtrar SOLO artículos con stock > 0 (los agotados desaparecen automáticamente para facilitar el trabajo del stand)
    const availableItems = getSortedInventoryList().filter(item => {
        const stock = parseInt(item.stock) || 0;
        if (stock <= 0) return false;
        if (searchVal && !item.name.toLowerCase().includes(searchVal)) return false;
        return true;
    });

    if (availableItems.length === 0) {
        container.innerHTML = `
            <div class="col-span-2 py-6 text-center text-slate-400 italic text-xs">
                No hay artículos disponibles con ese filtro o el inventario se ha agotado.
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
        const isLowStock = stock <= 3;

        const btnClass = canAfford
            ? "bg-emerald-600/20 hover:bg-emerald-600/40 active:scale-[0.99] border-emerald-500/40 text-slate-100 cursor-pointer"
            : "bg-slate-800/40 border-slate-700/50 text-slate-500 opacity-60 cursor-not-allowed";

        const stockClass = isLowStock
            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
            : "bg-slate-800 text-slate-300 border border-slate-700";

        html += `
            <button type="button" ${canAfford ? `onclick="redeemInventoryItem('${item.id}')"` : "disabled"} class="w-full p-2.5 rounded-xl border text-left transition flex justify-between items-center gap-2 ${btnClass}">
                <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-1.5">
                        <span class="text-base shrink-0">${item.emoji || '🎁'}</span>
                        <span class="font-bold text-xs truncate">${item.name}</span>
                    </div>
                    <div class="flex items-center gap-2 mt-1">
                        <span class="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${stockClass}">
                            Quedan: ${stock}
                        </span>
                        <span class="text-[11px] font-mono font-extrabold ${canAfford ? 'text-amber-400' : 'text-slate-500'}">
                            -${cost.toLocaleString()} 🪙
                        </span>
                    </div>
                </div>
                <div class="shrink-0 text-right">
                    ${canAfford
                        ? `<span class="bg-emerald-500 text-slate-950 font-extrabold px-2.5 py-1 rounded-lg text-[11px] shadow">Canjear</span>`
                        : `<span class="text-[10px] font-semibold text-rose-400/90 block">Faltan<br>${missing.toLocaleString()} 🪙</span>`
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

    // 1. LOG DE ARCADE (Solo 1 registro máximo por juego + Bono 500 de 4 metas)
    const arcadeGames = [
        { key: "chico", icon: "🦖", label: "Chicosaurio", score: scores.chico || 0, unit: "pts", coins: ledger.gameCoins.chico },
        { key: "chica", icon: "👰🏻‍♀️", label: "Atrapa el Amor", score: scores.chica || 0, unit: "pts", coins: ledger.gameCoins.chica },
        { key: "maddie", icon: "🐶", label: "Atrapa a Maddie", score: scores.maddie || 0, unit: "clics", coins: ledger.gameCoins.maddie },
        { key: "puebla", icon: "🚗", label: "Camino a Puebla", score: scores.puebla || 0, unit: "pts", coins: ledger.gameCoins.puebla }
    ];

    let arcadeHtml = "";
    arcadeGames.forEach(g => {
        arcadeHtml += `
            <div class="flex justify-between items-center py-1 border-b border-slate-700/40 last:border-none">
                <span>${g.icon} <strong>${g.label}</strong> <span class="text-slate-400">(Récord máx: ${g.score} ${g.unit})</span></span>
                <span class="font-mono font-bold ${g.coins > 0 ? 'text-emerald-400' : 'text-slate-500'}">+${g.coins.toLocaleString()} 🪙</span>
            </div>
        `;
    });

    arcadeHtml += `
        <div class="flex justify-between items-center pt-1.5 border-t border-slate-700/70">
            <span>🏆 <strong>Bono 4 Metas Superadas</strong></span>
            <span class="font-mono font-bold ${ledger.hasAllMetasBonus ? 'text-amber-400' : 'text-slate-500'}">
                ${ledger.hasAllMetasBonus ? '+500 🪙 (Desbloqueado ✓)' : '+0 🪙 (Pendiente)'}
            </span>
        </div>
    `;
    if (arcadeListEl) arcadeListEl.innerHTML = arcadeHtml;

    // 2. LOG DE ACTIVIDADES FÍSICAS (Múltiples registros de Plinko, Yahtzee, Premios)
    if (activitiesListEl) {
        if (ledger.activityLogsList.length === 0) {
            activitiesListEl.innerHTML = `<p class="text-slate-500 italic py-1">Sin puntos de actividades registrados aún.</p>`;
        } else {
            activitiesListEl.innerHTML = ledger.activityLogsList.map(entry => {
                const icon = entry.type === "plinko" ? "🎯" : (entry.type === "yahtzee" ? "🎲" : "✨");
                const timeStr = formatTimeShort(entry.timestamp);
                return `
                    <div class="flex justify-between items-center bg-slate-900/60 px-2.5 py-1.5 rounded-lg border border-slate-700/40">
                        <div>
                            <span class="font-semibold text-slate-200">${icon} ${entry.label || 'Actividad'}</span>
                            ${timeStr ? `<span class="text-[10px] text-slate-500 ml-1.5">${timeStr}</span>` : ''}
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="font-mono font-bold text-indigo-300">+${(parseInt(entry.amount) || 0).toLocaleString()} 🪙</span>
                            <button onclick="revertActivityLog('${entry.key}')" class="text-[10px] bg-slate-700 hover:bg-red-500/80 text-slate-300 hover:text-white px-2 py-0.5 rounded transition" title="Revertir este abono">
                                ↩️ Revertir
                            </button>
                        </div>
                    </div>
                `;
            }).join("");
        }
    }

    // 3. LOG DE CANJES EN TIENDA (Múltiples registros con reversión de stock)
    if (redemptionsListEl) {
        if (ledger.redemptionLogsList.length === 0) {
            redemptionsListEl.innerHTML = `<p class="text-slate-500 italic py-1">No ha canjeado artículos todavía.</p>`;
        } else {
            redemptionsListEl.innerHTML = ledger.redemptionLogsList.map(entry => {
                const timeStr = formatTimeShort(entry.timestamp);
                return `
                    <div class="flex justify-between items-center bg-slate-900/60 px-2.5 py-1.5 rounded-lg border border-slate-700/40">
                        <div>
                            <span class="font-semibold text-slate-200">${entry.emoji || '🛍️'} ${entry.itemName}</span>
                            ${timeStr ? `<span class="text-[10px] text-slate-500 ml-1.5">${timeStr}</span>` : ''}
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="font-mono font-bold text-rose-400">-${(parseInt(entry.cost) || 0).toLocaleString()} 🪙</span>
                            <button onclick="revertRedemptionLog('${entry.key}')" class="text-[10px] bg-slate-700 hover:bg-amber-500 hover:text-slate-950 text-slate-300 px-2 py-0.5 rounded transition font-semibold" title="Devolver artículo al inventario y reembolsar ChiCoins">
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
function syncPlayerLedgerTotals(playerKey) {
    const playerRef = db.ref("players/" + playerKey);
    return playerRef.transaction((currentData) => {
        if (!currentData) return currentData;
        const ledger = computePlayerLedger(currentData);
        currentData.arcadeCoins = ledger.arcadeCoins;
        currentData.activityCoins = ledger.activityCoins;
        currentData.spentCoins = ledger.spentCoins;
        currentData.adminBonus = ledger.activityCoins - ledger.spentCoins;
        currentData.bonusCoins = ledger.activityCoins - ledger.spentCoins;
        currentData.totalChiCoins = ledger.netCoins;
        currentData.lastUpdated = firebase.database.ServerValue.TIMESTAMP;
        return currentData;
    });
}

function addActivityPoints(type, defaultLabel, amount) {
    if (!selectedPlayerKey) return;
    const p = allPlayers[selectedPlayerKey];
    if (!p) return;

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

    db.ref(`players/${selectedPlayerKey}/activityLogs/${logId}`).set(entry)
        .then(() => syncPlayerLedgerTotals(selectedPlayerKey))
        .catch(err => alert("Error al abonar puntos: " + err.message));
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
        alert("Ingresa una cantidad positiva válida de ChiCoins para abonar.");
        return;
    }

    let baseLabel = "Premio Especial";
    if (type === "plinko") baseLabel = "Plinko";
    else if (type === "yahtzee") baseLabel = "Yahtzee";

    const finalLabel = customNote ? `${baseLabel}: ${customNote}` : baseLabel;

    addActivityPoints(type, finalLabel, amount);
    noteInput.value = "";
    amountInput.value = "";
}

function redeemInventoryItem(itemId) {
    if (!selectedPlayerKey || isRedeeming) return;
    const p = allPlayers[selectedPlayerKey];
    const item = allInventory[itemId];
    if (!p || !item) return;

    const cost = parseInt(item.cost) || 0;
    const ledger = computePlayerLedger(p);

    if (ledger.netCoins < cost) {
        alert(`❌ Saldo insuficiente: ${p.gamerTag} tiene ${ledger.netCoins.toLocaleString()} 🪙 y "${item.name}" cuesta ${cost.toLocaleString()} 🪙.`);
        return;
    }

    isRedeeming = true;

    // 1. Transacción atómica en el inventario para descontar 1 unidad de forma segura
    const itemStockRef = db.ref(`inventory/${itemId}/stock`);
    itemStockRef.transaction((currentStock) => {
        const s = parseInt(currentStock) || 0;
        if (s <= 0) {
            return; // Aborta la transacción si ya se agotó
        }
        return s - 1;
    }, (error, committed, snapshot) => {
        if (error) {
            isRedeeming = false;
            alert("Error de conexión al verificar inventario: " + error.message);
            return;
        }
        if (!committed) {
            isRedeeming = false;
            alert(`⚠️ Lo sentimos, "${item.name}" acaba de agotarse.`);
            return;
        }

        // 2. Registrar el canje en la bitácora del jugador y actualizar su balance neto
        const logId = "red_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
        const redemptionEntry = {
            id: logId,
            itemId: itemId,
            itemName: item.name,
            emoji: item.emoji || "🛍️",
            cost: cost,
            timestamp: Date.now()
        };

        db.ref(`players/${selectedPlayerKey}/redemptionLogs/${logId}`).set(redemptionEntry)
            .then(() => syncPlayerLedgerTotals(selectedPlayerKey))
            .then(() => {
                isRedeeming = false;
            })
            .catch(err => {
                // Si falló la escritura en el jugador, devolver +1 al inventario
                adjustInventoryItemStock(itemId, 1);
                isRedeeming = false;
                alert("Error al registrar el canje: " + err.message);
            });
    });
}

function revertActivityLog(logKey) {
    if (!selectedPlayerKey) return;
    const p = allPlayers[selectedPlayerKey];
    const entry = p?.activityLogs?.[logKey];
    if (!entry) return;

    if (confirm(`¿Revertir el abono de "${entry.label}" (+${entry.amount} 🪙)?`)) {
        db.ref(`players/${selectedPlayerKey}/activityLogs/${logKey}`).remove()
            .then(() => syncPlayerLedgerTotals(selectedPlayerKey))
            .catch(err => alert("Error al revertir abono: " + err.message));
    }
}

function revertRedemptionLog(logKey) {
    if (!selectedPlayerKey) return;
    const p = allPlayers[selectedPlayerKey];
    const entry = p?.redemptionLogs?.[logKey];
    if (!entry) return;

    if (confirm(`¿Devolver "${entry.itemName}" al inventario (+1 ud) y reembolsar +${entry.cost.toLocaleString()} 🪙 a ${p.gamerTag}?`)) {
        // 1. Devolver +1 al stock del artículo en inventario (si existe en el catálogo)
        if (entry.itemId && allInventory[entry.itemId]) {
            adjustInventoryItemStock(entry.itemId, 1);
        }
        // 2. Eliminar registro del log de canjes y recalcular saldo del jugador
        db.ref(`players/${selectedPlayerKey}/redemptionLogs/${logKey}`).remove()
            .then(() => syncPlayerLedgerTotals(selectedPlayerKey))
            .catch(err => alert("Error al revertir canje: " + err.message));
    }
}

// ==========================================
// ZONA DE PELIGRO & BACKUPS
// ==========================================
function resetPlayerStats() {
    if (!selectedPlayerKey) return;
    const p = allPlayers[selectedPlayerKey];
    const tag = p.gamerTag || selectedPlayerKey;

    if (confirm(`⚠️ ¿Estás SEGURO de querer REINICIAR A CEROS todos los puntos, actividades y canjes de ${tag}?`)) {
        db.ref("players/" + selectedPlayerKey).update({
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
            alert(`✅ Los datos de ${tag} han sido reiniciados a ceros.`);
        }).catch(err => alert("Error: " + err.message));
    }
}

function deletePlayerRecord() {
    if (!selectedPlayerKey) return;
    const p = allPlayers[selectedPlayerKey];
    const tag = p.gamerTag || selectedPlayerKey;

    if (confirm(`🚨 PELIGRO: ¿Borrar por completo el registro de ${tag}?`)) {
        db.ref("players/" + selectedPlayerKey).remove().then(() => {
            alert(`🗑️ El jugador ${tag} ha sido eliminado.`);
            document.getElementById("noSelectionState").classList.remove("hidden");
            document.getElementById("selectionState").classList.add("hidden");
            document.getElementById("selectionState").classList.remove("flex");
            selectedPlayerKey = null;
        }).catch(err => alert("Error al borrar: " + err.message));
    }
}

function wipeEntireDatabase() {
    const pass = prompt("🚨 ATENCIÓN 🚨\n\nEstás a punto de BORRAR TODOS LOS JUGADORES.\nEscribe 'Chicos0212' para confirmar:");
    if (pass === "Chicos0212") {
        if (confirm("¿Estás absolutamente seguro? ESTO NO SE PUEDE DESHACER.")) {
            db.ref("players").remove().then(() => {
                alert("✅ Todos los jugadores fueron eliminados exitosamente.");
                document.getElementById("noSelectionState").classList.remove("hidden");
                document.getElementById("selectionState").classList.add("hidden");
                document.getElementById("selectionState").classList.remove("flex");
                selectedPlayerKey = null;
            }).catch(err => alert("❌ Error al borrar: " + err.message));
        }
    } else if (pass !== null) {
        alert("❌ Contraseña incorrecta. Abortando.");
    }
}

function downloadBackupJSON() {
    const backupPayload = {
        timestamp: new Date().toISOString(),
        players: allPlayers || {},
        inventory: allInventory || {}
    };
    const dateStr = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupPayload, null, 2));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `backup-boda-completo-${dateStr}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
}

function restoreBackupJSON(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const parsed = JSON.parse(e.target.result);
            if (!parsed || typeof parsed !== "object") {
                alert("❌ Archivo inválido.");
                return;
            }
            const hasStructuredBackup = parsed.players || parsed.inventory;
            const playersToRestore = hasStructuredBackup ? (parsed.players || {}) : parsed;
            const inventoryToRestore = hasStructuredBackup ? (parsed.inventory || null) : null;

            const count = Object.keys(playersToRestore).length;
            if (!confirm(`⚠️ ¿Deseas RESTAURAR la base de datos con ${count} jugadores${inventoryToRestore ? ' y el inventario incluido' : ''}?`)) {
                event.target.value = "";
                return;
            }

            const promises = [db.ref("players").set(playersToRestore)];
            if (inventoryToRestore) {
                promises.push(db.ref("inventory").set(inventoryToRestore));
            }

            Promise.all(promises).then(() => {
                alert(`✅ ¡Respaldo restaurado exitosamente!`);
            }).catch(err => {
                alert("❌ Error al restaurar en Firebase: " + err.message);
            });
        } catch (err) {
            alert("❌ Error al procesar el archivo JSON: " + err.message);
        } finally {
            event.target.value = "";
        }
    };
    reader.readAsText(file);
}
