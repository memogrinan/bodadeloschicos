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

        let allPlayers = {};
        let selectedPlayerKey = null;

        document.addEventListener("DOMContentLoaded", () => {
            checkAdminAuth();
            listenToPlayers();
        });

        function checkAdminAuth() {
            if (sessionStorage.getItem("bodachicos_admin_auth") !== "true") {
                const pass = prompt("🔐 Acceso Administrador - Ingresa la contraseña:");
                if (pass && pass.trim() === "Chicos0212") {
                    sessionStorage.setItem("bodachicos_admin_auth", "true");
                } else {
                    alert("Acceso denegado: Contraseña incorrecta.");
                    window.location.href = "juegos.html";
                }
            }
        }

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
            const filter = document.getElementById("searchInput").value.toLowerCase().trim();
            
            const keys = Object.keys(allPlayers).sort((a, b) => (allPlayers[b].totalChiCoins || 0) - (allPlayers[a].totalChiCoins || 0));
            
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

                const coins = p.totalChiCoins || 0;
                const isSelected = key === selectedPlayerKey;

                html += `
                    <tr class="hover:bg-slate-700/40 transition ${isSelected ? 'bg-amber-500/10 border-l-4 border-amber-400' : ''}">
                        <td class="py-3 px-3">
                            <div class="font-bold text-slate-100">${tag}</div>
                            ${rName ? `<div class="text-xs text-slate-400 mt-0.5">${rName}</div>` : ''}
                        </td>
                        <td class="py-3 px-3 font-mono font-bold text-amber-400 text-base">${coins.toLocaleString()} 🪙</td>
                        <td class="py-3 px-3">
                            <button onclick="selectPlayer('${key}')" class="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs transition shadow">
                                ${isSelected ? 'Seleccionado ✓' : 'Gestionar'}
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

            document.getElementById("selectedTag").innerText = p.gamerTag || key;
            document.getElementById("selectedCoins").innerText = (p.totalChiCoins || 0).toLocaleString() + " 🪙";

            const scores = p.scores || {};
            document.getElementById("score-chico-val").innerText = (scores.chico || 0) + " pts";
            document.getElementById("score-chica-val").innerText = (scores.chica || 0) + " pts";
            document.getElementById("score-maddie-val").innerText = (scores.maddie || 0) + " clics";
            document.getElementById("score-puebla-val").innerText = (scores.puebla || 0) + " pts";
            document.getElementById("bonus-val").innerText = "+" + (p.bonusCoins || 0) + " 🪙";

            renderPlayersTable();
        }

        function addPhysicalBonus(amount, reason) {
            if (!selectedPlayerKey) return;
            const p = allPlayers[selectedPlayerKey];
            const currentBonus = (p.adminBonus !== undefined ? p.adminBonus : p.bonusCoins) || 0;
            const newBonus = currentBonus + amount;
            const currentTotal = p.totalChiCoins || 0;
            const newTotal = currentTotal + amount;

            db.ref("players/" + selectedPlayerKey).update({
                bonusCoins: newBonus,
                adminBonus: newBonus,
                totalChiCoins: newTotal,
                lastUpdated: firebase.database.ServerValue.TIMESTAMP
            }).then(() => {
                alert(`¡Se añadieron +${amount} ChiCoins a ${p.gamerTag} por (${reason})!`);
            }).catch(err => alert("Error: " + err.message));
        }

        function redeemItem(cost, itemName) {
            if (!selectedPlayerKey) return;
            const p = allPlayers[selectedPlayerKey];
            const currentTotal = p.totalChiCoins || 0;

            if (currentTotal < cost) {
                alert(`❌ Saldo insuficiente: ${p.gamerTag || 'El jugador'} tiene ${currentTotal.toLocaleString()} 🪙 y el artículo cuesta ${cost.toLocaleString()} 🪙.\nFaltan ${(cost - currentTotal).toLocaleString()} 🪙 para poder canjear.`);
                return;
            }

            const currentBonus = (p.adminBonus !== undefined ? p.adminBonus : p.bonusCoins) || 0;
            const newBonus = currentBonus - cost;
            const newTotal = currentTotal - cost;

            db.ref("players/" + selectedPlayerKey).update({
                bonusCoins: newBonus,
                adminBonus: newBonus,
                totalChiCoins: newTotal,
                lastUpdated: firebase.database.ServerValue.TIMESTAMP
            }).then(() => {
                alert(`🛍️ Canje exitoso: ${itemName} para ${p.gamerTag}.\nNuevo saldo restante: ${newTotal.toLocaleString()} 🪙`);
            }).catch(err => alert("Error: " + err.message));
        }

        function applyCustomAdjustment() {
            if (!selectedPlayerKey) return;
            const input = document.getElementById("customAmountInput");
            const val = parseInt(input.value);
            if (isNaN(val) || val === 0) {
                alert("Por favor ingresa una cantidad válida (+ o -).");
                return;
            }
            addPhysicalBonus(val, "Ajuste manual");
            input.value = "";
        }

        function resetPlayerStats() {
            if (!selectedPlayerKey) return;
            const p = allPlayers[selectedPlayerKey];
            const tag = p.gamerTag || selectedPlayerKey;
            
            if (confirm(`⚠️ ¿Estás COMPLETAMENTE SEGURO de querer REINICIAR A CEROS todos los puntos y ChiCoins de ${tag}? Esta acción no se puede deshacer.`)) {
                db.ref("players/" + selectedPlayerKey).update({
                    scores: { chico: 0, chica: 0, maddie: 0, puebla: 0 },
                    chiCoins: { chico: 0, chica: 0, maddie: 0, puebla: 0 },
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
            
            if (confirm(`🚨 PELIGRO: ¿Estás seguro de que quieres BORRAR POR COMPLETO el registro de ${tag}? Desaparecerá del Leaderboard.`)) {
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
            const pass = prompt("🚨 ATENCIÓN 🚨\n\nEstás a punto de BORRAR TODA LA BASE DE DATOS.\nEscribe la contraseña 'Chicos0212' para confirmar:");
            if (pass === "Chicos0212") {
                if (confirm("¿Estás absolutamente seguro? ESTO NO SE PUEDE DESHACER.")) {
                    db.ref("players").remove().then(() => {
                        alert("✅ Base de datos reseteada a ceros exitosamente.");
                        document.getElementById("noSelectionState").classList.remove("hidden");
                        document.getElementById("selectionState").classList.add("hidden");
                        document.getElementById("selectionState").classList.remove("flex");
                        selectedPlayerKey = null;
                    }).catch(err => {
                        alert("❌ Error al borrar: " + err.message);
                    });
                }
            } else if (pass !== null) {
                alert("❌ Contraseña incorrecta. Abortando.");
            }
        }

        // COPIAS DE SEGURIDAD (BACKUP & RESTORE EN UN CLIC)
        function downloadBackupJSON() {
            if (!allPlayers || Object.keys(allPlayers).length === 0) {
                alert("No hay datos de jugadores actualmente para respaldar.");
                return;
            }
            const dateStr = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allPlayers, null, 2));
            const dlAnchor = document.createElement("a");
            dlAnchor.setAttribute("href", dataStr);
            dlAnchor.setAttribute("download", `backup-boda-arcade-${dateStr}.json`);
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
                        alert("❌ Archivo inválido: El archivo seleccionado no contiene datos JSON válidos.");
                        return;
                    }
                    const count = Object.keys(parsed).length;
                    const confirmRestore = confirm(`⚠️ ¿Deseas RESTAURAR la base de datos con los datos de este archivo?\n\nJugadores en el respaldo: ${count}\n\nEsto sobreescribirá los registros actuales en Firebase.`);
                    if (!confirmRestore) {
                        event.target.value = "";
                        return;
                    }

                    db.ref("players").set(parsed).then(() => {
                        alert(`✅ ¡Base de datos restaurada exitosamente con ${count} jugadores!`);
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
