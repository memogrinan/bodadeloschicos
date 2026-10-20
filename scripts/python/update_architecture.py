import re

path = "BodaWebpage/js/juegos.js"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Variables globales
content = content.replace("let playerRealName = \"\";", "let playerRealName = \"\";\n        let playerGuestId = \"\";\n        let partyMembersData = [];")
content = content.replace("const savedReal = localStorage.getItem(\"bodachicos_real_name\");", "const savedReal = localStorage.getItem(\"bodachicos_real_name\");\n            const savedGuestId = localStorage.getItem(\"bodachicos_guest_id\");")
content = content.replace("playerRealName = savedReal || \"\";", "playerRealName = savedReal || \"\";\n            playerGuestId = savedGuestId || \"\";")

# 2. Modificar la obtención del keyTag
# Buscamos: const keyTag = playerGamertag.trim().replace(/[.#$/[\]]/g, "_");
new_keytag = """let keyTag = playerGuestId;
            if (!keyTag) keyTag = playerGamertag.trim().replace(/[.#$/[\]]/g, "_");"""
content = content.replace('const keyTag = playerGamertag.trim().replace(/[.#$/\\[\\]]/g, "_");', new_keytag)

# 3. Payload update
content = content.replace("partyId: currentPartyId || \"general\",", "partyId: currentPartyId || \"general\",\n                guestId: playerGuestId,")

# 4. Modificar prepareGamertagModal
pattern_prepare = r"if \(data\.status === \"success\" && data\.integrantes\) \{.*?renderMemberButtons\(\);\s*\}"
new_prepare = """if (data.status === "success") {
                        if (data.integrantesData) {
                            partyMembersData = data.integrantesData;
                        } else if (data.integrantes) {
                            // Fallback
                            partyMembersData = data.integrantes.toString().split(",").map(s => ({ id: "", name: s.trim() }));
                        }
                        renderMemberButtons();
                    }"""
content = re.sub(pattern_prepare, new_prepare, content, flags=re.DOTALL)

# 5. Modificar renderMemberButtons
pattern_render = r"function renderMemberButtons\(\) \{.*?buttonsList\.appendChild\(btn\);\s*\}\);"
new_render = """function renderMemberButtons() {
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
            });"""
content = re.sub(pattern_render, new_render, content, flags=re.DOTALL)

# 6. Modificar selectMemberChoice
pattern_select = r"function selectMemberChoice\(idx, memberName\) \{.*?selectedRealName = memberName;"
new_select = """function selectMemberChoice(idx, memberName, memberId) {
            selectedRealName = memberName;
            playerGuestId = memberId || "";"""
content = re.sub(pattern_select, new_select, content, flags=re.DOTALL)

# Cambiar el query de auto-fill para usar guestId
content = content.replace("db.ref(\"players\").orderByChild(\"realName\").equalTo(selectedRealName).once(\"value\")", "db.ref(\"players/\" + playerGuestId).once(\"value\")")

# Auto-fill adaptation (because now it returns the player node directly, not a list of players)
pattern_autofill = r"const data = snap\.val\(\);\s+if \(data\) \{\s+// Tomamos el primer registro.*?\s+const keys = Object\.keys\(data\);\s+if \(keys\.length > 0\) \{\s+const playerNode = data\[keys\[0\]\];\s+if \(playerNode && playerNode\.gamerTag\) \{.*?\}\s+\}\s+\}"
new_autofill = """const playerNode = snap.val();
                    if (playerNode && playerNode.gamerTag) {
                        const inputEl = document.getElementById("gamertagInput");
                        if (inputEl) {
                            inputEl.value = playerNode.gamerTag;
                            inputEl.classList.add("bg-green-50");
                            setTimeout(() => inputEl.classList.remove("bg-green-50"), 1000);
                        }
                    }"""
content = re.sub(pattern_autofill, new_autofill, content, flags=re.DOTALL)

# 7. Modificar saveGamerTag local storage
content = content.replace("localStorage.setItem(\"bodachicos_real_name\", selectedRealName);", "localStorage.setItem(\"bodachicos_real_name\", selectedRealName);\n                if (playerGuestId) localStorage.setItem(\"bodachicos_guest_id\", playerGuestId);")

# 8. Modificar la migración en saveGamerTag (AHORA ES INNECESARIA PORQUE LA LLAVE ES EL GUEST ID!)
# Solo mantenemos la lógica de leer el nodo actual y sobreescribir el local storage.
pattern_save = r"// 1\. Buscar si ya existe este invitado con un Gamertag anterior.*?// Descargar los puntos a memoria local.*?updateScoresDashboard\(\);\s*\}"
# We will just write a cleaner saveGamerTag logic.
