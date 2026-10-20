import re

path = "BodaWebpage/js/juegos.js"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Variables Globales
content = content.replace('let selectedRealName = "";', 'let selectedRealName = "";\n        let playerGuestId = "";\n        let partyMembersData = [];')

# 2. loadLocalData
content = content.replace('const savedReal = localStorage.getItem("bodachicos_real_name");', 'const savedReal = localStorage.getItem("bodachicos_real_name");\n            const savedGuestId = localStorage.getItem("bodachicos_guest_id");')
content = content.replace('playerRealName = savedReal || "";', 'playerRealName = savedReal || "";\n            playerGuestId = savedGuestId || "";')
content = content.replace('const keyTag = playerGamertag.trim().replace(/[.#$/\\[\\]]/g, "_");', 'const keyTag = playerGuestId || playerGamertag.trim().replace(/[.#$/\\[\\]]/g, "_");')

# 3. syncPlayerToFirebase
content = content.replace('const payload = {\n                gamerTag: playerGamertag.trim(),', 'const payload = {\n                gamerTag: playerGamertag.trim(),\n                guestId: playerGuestId,')

# 4. prepareGamertagModal
prepare_old = """if (data.status === "success" && data.integrantes) {
                        partyMembers = data.integrantes.toString().split(",").map(s => s.trim());
                        renderMemberButtons();
                    }"""
prepare_new = """if (data.status === "success") {
                        if (data.integrantesData) {
                            partyMembersData = data.integrantesData;
                        } else if (data.integrantes) {
                            partyMembersData = data.integrantes.toString().split(",").map(s => ({ id: "", name: s.trim() }));
                        }
                        renderMemberButtons();
                    }"""
content = content.replace(prepare_old, prepare_new)

# 5. renderMemberButtons
render_old = """function renderMemberButtons() {
            const buttonsList = document.getElementById("memberButtonsList");
            if (!buttonsList) return;
            buttonsList.innerHTML = "";
            
            let defaultIdx = -1;
            if (playerRealName) {
                defaultIdx = partyMembers.indexOf(playerRealName);
            }
            if (defaultIdx !== -1) {
                selectedRealName = partyMembers[defaultIdx];
            }

            partyMembers.forEach((member, idx) => {
                const isSel = (idx === defaultIdx);
                const btn = document.createElement("button");
                btn.type = "button";
                btn.onclick = () => selectMemberChoice(idx, member);
                btn.className = `w-full text-left px-3 py-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-between member-btn ${isSel ? 'border-olivo-base bg-amber-50 text-olivo-base shadow-xs' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`;
                btn.innerHTML = `<span>👤 ${member}</span><span class="check-icon ${isSel ? '' : 'hidden'} font-bold">✓</span>`;
                buttonsList.appendChild(btn);
            });
        }"""
render_new = """function renderMemberButtons() {
            const buttonsList = document.getElementById("memberButtonsList");
            if (!buttonsList) return;
            buttonsList.innerHTML = "";
            
            let defaultIdx = -1;
            if (playerRealName) {
                defaultIdx = partyMembersData.findIndex(m => m.name === playerRealName);
            }
            if (defaultIdx !== -1) {
                selectedRealName = partyMembersData[defaultIdx].name;
                playerGuestId = partyMembersData[defaultIdx].id;
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
        }"""
content = content.replace(render_old, render_new)

# 6. selectMemberChoice
select_old = """function selectMemberChoice(idx, memberName) {
            selectedRealName = memberName;

            // PASO 1: Autocompletado (Auto-fill) de Gamertag
            // Busca en la base de datos si este Nombre Real ya está vinculado a un Gamertag.
            if (db && selectedRealName) {
                db.ref("players").orderByChild("realName").equalTo(selectedRealName).once("value").then(snap => {
                    const data = snap.val();
                    if (data) {
                        // Tomamos el primer registro encontrado (si hay varios, tomamos el más antiguo/primero)
                        const keys = Object.keys(data);
                        if (keys.length > 0) {
                            const playerNode = data[keys[0]];
                            if (playerNode && playerNode.gamerTag) {
                                const inputEl = document.getElementById("gamertagInput");
                                if (inputEl) {
                                    inputEl.value = playerNode.gamerTag;
                                    // Feedback visual opcional para que sepa que se autocompletó
                                    inputEl.classList.add("bg-green-50");
                                    setTimeout(() => inputEl.classList.remove("bg-green-50"), 1000);
                                }
                            }
                        }
                    }
                }).catch(e => console.warn("No se pudo pre-cargar el Gamertag:", e));
            }"""
select_new = """function selectMemberChoice(idx, memberName, memberId) {
            selectedRealName = memberName;
            playerGuestId = memberId || "";

            // AUTO-FILL: Buscamos si el ID de invitado ya tiene un Gamertag
            if (db && playerGuestId) {
                db.ref("players/" + playerGuestId).once("value").then(snap => {
                    const playerNode = snap.val();
                    if (playerNode && playerNode.gamerTag) {
                        const inputEl = document.getElementById("gamertagInput");
                        if (inputEl) {
                            inputEl.value = playerNode.gamerTag;
                            inputEl.classList.add("bg-green-50");
                            setTimeout(() => inputEl.classList.remove("bg-green-50"), 1000);
                        }
                    }
                }).catch(e => console.warn("No se pudo pre-cargar el Gamertag:", e));
            }"""
content = content.replace(select_old, select_new)

# 7. saveGamerTag
save_pattern = r"const newKey = val\.replace.*?updateScoresDashboard\(\);\s*syncPlayerToFirebase\(\);\s*\}"
save_new = """const legacyKey = val.replace(/[.#$/[\\]]/g, "_");
            const targetKey = playerGuestId || legacyKey;

            if (db) {
                try {
                    // MIGRACIÓN ONE-TIME: Si tenían datos bajo su Gamertag viejo, los movemos al Guest ID
                    if (targetKey !== legacyKey) {
                        const legacySnap = await db.ref("players/" + legacyKey).once("value");
                        const legacyData = legacySnap.val();
                        if (legacyData) {
                            await db.ref("players/" + targetKey).set(legacyData);
                            await db.ref("players/" + legacyKey).remove(); // Elimina el fantasma viejo
                        }
                    }

                    // Descargar puntajes de la nube al celular
                    const snap = await db.ref("players/" + targetKey).once("value");
                    const data = snap.val();
                    
                    if (data && data.scores) {
                        Object.keys(data.scores).forEach(g => {
                            localStorage.setItem("bodachicos_score_" + g, data.scores[g]);
                        });
                        if (data.bonusCoins) localStorage.setItem("bodachicos_bonus_chicoins", data.bonusCoins);
                        if (data.timePlayedSeconds) localStorage.setItem("bodachicos_time_played", data.timePlayedSeconds);
                    }
                } catch (e) {
                    console.warn("No se pudo descargar progreso previo:", e);
                }
            }

            if (btn) {
                btn.innerText = "Comenzar a Jugar 🎮";
                btn.disabled = false;
                btn.classList.remove("opacity-70", "cursor-wait");
            }

            localStorage.setItem("bodachicos_gamertag", val);
            if (selectedRealName) {
                localStorage.setItem("bodachicos_real_name", selectedRealName);
                playerRealName = selectedRealName;
            }
            if (playerGuestId) {
                localStorage.setItem("bodachicos_guest_id", playerGuestId);
            }
            playerGamertag = val;
            
            document.getElementById("playerGamertag").innerText = playerGamertag;
            document.getElementById("bottomGamerTag").innerText = playerGamertag;
            
            closeGamertagModal();
            updateScoresDashboard();
            syncPlayerToFirebase();
        }"""
content = re.sub(save_pattern, save_new, content, flags=re.DOTALL)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
