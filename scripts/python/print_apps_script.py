apps_script = """function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[0];
  var rows = sheet.getDataRange().getValues();
  var partyId = e.parameter.id;
  
  if (!partyId) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "No ID provided" })).setMimeType(ContentService.MimeType.JSON);
  }
  
  var matchingRows = [];
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] && rows[i][0].toString().trim().toLowerCase() === partyId.trim().toLowerCase()) {
      matchingRows.push({ rowIndex: i + 1, rowData: rows[i] });
    }
  }
  
  if (matchingRows.length === 0) {
    return ContentService.createTextOutput(JSON.stringify({ status: "not_found" })).setMimeType(ContentService.MimeType.JSON);
  }
  
  var firstRow = matchingRows[0].rowData;
  var allIntegrantes = [];
  var integrantesData = [];
  var estadoSabadoList = [];
  var estadoCivilList = [];
  var alergiasList = [];
  
  matchingRows.forEach(function(item) {
    var memberName = item.rowData[2] ? item.rowData[2].toString().trim() : "";
    var customGuestId = item.rowData[14] ? item.rowData[14].toString().trim() : "";
    
    // Si la celda O (ID Arcade) está vacía, autogeneramos un ID indestructible basado en la fila
    var guestId = customGuestId !== "" ? customGuestId : ("GID_" + item.rowData[0].toString().trim() + "_" + item.rowIndex);

    if (memberName) {
      allIntegrantes.push(memberName);
      integrantesData.push({ id: guestId, name: memberName });

      if (item.rowData[5]) estadoSabadoList.push(memberName + ": " + item.rowData[5]);
      if (item.rowData[6]) estadoCivilList.push(memberName + ": " + item.rowData[6]);
      if (item.rowData[7] && item.rowData[7].toString().trim() !== "" && item.rowData[7].toString().trim() !== "Ninguna" && item.rowData[7].toString().trim() !== "Nones") {
        alergiasList.push(memberName + ": " + item.rowData[7]);
      }
    }
  });
  
  var data = {
    status: "success",
    id: firstRow[0],
    nombre: firstRow[1],
    integrantes: allIntegrantes.join(", "),
    integrantesData: integrantesData,
    invitaCivil: firstRow[3],
    pasesSabado: firstRow[4],
    estadoSabado: estadoSabadoList.length > 0 ? estadoSabadoList.join(" | ") : firstRow[5],
    estadoCivil: estadoCivilList.length > 0 ? estadoCivilList.join(" | ") : firstRow[6],
    alergias: alergiasList.length > 0 ? alergiasList.join(" | ") : firstRow[7],
    celebracion: firstRow[8]
  };
  
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var contents = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheets()[0];
    
    // --- 🎮 NUEVA LÓGICA: ESTADÍSTICAS DEL ARCADE EN LA PESTAÑA PRINCIPAL ---
    if (contents.action === "updateGameStats") {
      var rows = sheet.getDataRange().getValues();
      var rowIndex = -1;
      
      // Buscar la fila exacta del invitado por su Guest ID
      if (contents.guestId) {
        for (var i = 1; i < rows.length; i++) {
          var rowCustomId = rows[i][14] ? rows[i][14].toString().trim() : "";
          var rowAutoId = "GID_" + rows[i][0].toString().trim() + "_" + (i + 1);
          
          if (rowCustomId === contents.guestId || rowAutoId === contents.guestId) {
            rowIndex = i + 1;
            break;
          }
        }
      }
      
      // Fallback de seguridad: buscar por nombre si no se mandó el ID
      if (rowIndex === -1 && contents.realName) {
        for (var i = 1; i < rows.length; i++) {
          if (rows[i][2] && rows[i][2].toString().trim().toLowerCase() === contents.realName.trim().toLowerCase()) {
            rowIndex = i + 1;
            break;
          }
        }
      }
      
      if (rowIndex > -1) {
        // Actualizar Columnas: L (12) GamerTag, M (13) ChiCoins, N (14) Tiempo Jugado
        sheet.getRange(rowIndex, 12).setValue(contents.gamerTag);
        sheet.getRange(rowIndex, 13).setValue(contents.totalChiCoins);
        sheet.getRange(rowIndex, 14).setValue(contents.timePlayedSeconds);
      }
      
      return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
    }
    // --- FIN DE LÓGICA ARCADE ---


    // --- LÓGICA ORIGINAL DE RSVP ---
    var partyId = contents.id;
    var rowsData = sheet.getDataRange().getValues();
    
    var matchingRowsInfo = [];
    var familyName = "";
    
    for (var i = 1; i < rowsData.length; i++) {
      if (rowsData[i][0] && rowsData[i][0].toString().trim().toLowerCase() === partyId.trim().toLowerCase()) {
        matchingRowsInfo.push({
          rowIndex: i + 1,
          memberName: rowsData[i][2] ? rowsData[i][2].toString().trim() : ""
        });
        if (!familyName) familyName = rowsData[i][1];
      }
    }
    
    if (matchingRowsInfo.length === 0) {
      return ContentService.createTextOutput(JSON.stringify({ status: "not_found" })).setMimeType(ContentService.MimeType.JSON);
    }

    function parseMemberValue(fullStr, memberName) {
      if (!fullStr) return "";
      var parts = fullStr.split("|");
      for (var p = 0; p < parts.length; p++) {
        var pair = parts[p].split(":");
        if (pair.length >= 2) {
          var nameKey = pair[0].trim();
          var val = pair.slice(1).join(":").trim();
          if (nameKey.toLowerCase() === memberName.toLowerCase() || memberName.toLowerCase().indexOf(nameKey.toLowerCase()) !== -1 || nameKey.toLowerCase().indexOf(memberName.toLowerCase()) !== -1) {
            return val;
          }
        }
      }
      return fullStr;
    }

    // 1. Asignar SI / NO limpio por renglón
    if (matchingRowsInfo.length > 1) {
      matchingRowsInfo.forEach(function(info) {
        var sabadoVal = parseMemberValue(contents.estadoSabado, info.memberName) || "SI";
        var civilVal = parseMemberValue(contents.estadoCivil, info.memberName) || "N/A";
        var alergiaVal = parseMemberValue(contents.alergias, info.memberName) || "Ninguna";

        sheet.getRange(info.rowIndex, 6).setValue(sabadoVal);
        sheet.getRange(info.rowIndex, 7).setValue(civilVal);
        sheet.getRange(info.rowIndex, 8).setValue(alergiaVal);
        sheet.getRange(info.rowIndex, 9).setValue(contents.celebracion || "");
      });
    } else {
      sheet.getRange(matchingRowsInfo[0].rowIndex, 6).setValue(contents.estadoSabado);
      sheet.getRange(matchingRowsInfo[0].rowIndex, 7).setValue(contents.estadoCivil || "N/A");
      sheet.getRange(matchingRowsInfo[0].rowIndex, 8).setValue(contents.alergias || "Ninguna");
      sheet.getRange(matchingRowsInfo[0].rowIndex, 9).setValue(contents.celebracion || "");
    }

    // 2. Calcular analíticos globales precisos
    SpreadsheetApp.flush();
    var updatedRows = sheet.getDataRange().getValues();
    var confirmadosSabado = 0;
    var declinadosSabado = 0;
    var pendientes = 0;

    for (var j = 1; j < updatedRows.length; j++) {
      var memberName = updatedRows[j][2] ? updatedRows[j][2].toString().trim() : "";
      if (memberName !== "") { 
        var statusSabado = updatedRows[j][5] ? updatedRows[j][5].toString().trim().toUpperCase() : "";
        if (statusSabado === "") {
          pendientes += 1;
        } else if (statusSabado === "SI" || statusSabado.indexOf(": SI") !== -1) {
          confirmadosSabado += 1;
        } else if (statusSabado === "NO" || statusSabado.indexOf(": NO") !== -1) {
          declinadosSabado += 1;
        }
      }
    }

    // 3. Notificación por correo instantánea
    var recipient = "memoge55@gmail.com";
    var subject = "💌 Nueva Confirmación RSVP: " + (familyName || partyId);
    
    var body = "¡Hola Mariana y Memo!\\n\\n" +
               "Se ha recibido una respuesta en la invitación web:\\n\\n" +
               "📌 Invitación: " + familyName + "\\n" +
               "💒 Boda & Fiesta (Sábado): " + contents.estadoSabado + "\\n" +
               "🥂 Boda Civil (Viernes): " + (contents.estadoCivil || "N/A") + "\\n" +
               "🥗 Restricciones alimenticias: " + (contents.alergias || "Ninguna") + "\\n" +
               "🎉 Celebración especial: " + (contents.celebracion || "Ninguna") + "\\n\\n" +
               "─────────────────────────────\\n" +
               "📊 RESUMEN GENERAL ACUMULADO:\\n" +
               "• Confirmados (Sábado): " + confirmadosSabado + " personas\\n" +
               "• Declinados (Sábado): " + declinadosSabado + " personas\\n" +
               "• Pendientes por responder: " + pendientes + " personas\\n\\n" +
               "Ver lista completa en tu Google Sheet:\\n" + ss.getUrl();

    MailApp.sendEmail(recipient, subject, body);

    return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    Logger.log("Error en doPost: " + err.toString());
    return ContentService.createTextOutput(JSON.stringify({ status: "error", error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}
"""
with open("AppsScript_Nuevo.txt", "w", encoding="utf-8") as f:
    f.write(apps_script)
