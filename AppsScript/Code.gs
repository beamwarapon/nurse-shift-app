/**
 * Google Apps Script for Nurse Shift Scheduling App
 */

function getSheetData(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    if (sheetName === "Staff") {
      sheet = ss.insertSheet("Staff");
      sheet.appendRow(["ID", "Name", "Role", "Department"]);
    } else {
      return null;
    }
  }

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  const headers = data[0];
  const rows = data.slice(1);

  return rows.map(row => {
    let obj = {};
    headers.forEach((header, i) => {
      let value = row[i];
      if (value instanceof Date) {
        value = Utilities.formatDate(value, Session.getScriptTimeZone(), "yyyy-MM-dd");
      }
      obj[header] = value;
    });
    return obj;
  });
}

function doGet(e) {
  const shifts = getSheetData("Nurse-Shifts") || [];
  const staff = getSheetData("Staff") || [];
  
  return ContentService.createTextOutput(JSON.stringify({
    shifts: shifts,
    staff: staff
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const action = postData.action;

    // --- Action: Add Staff ---
    if (action === "addStaff") {
      let sheet = ss.getSheetByName("Staff");
      if (!sheet) {
        sheet = ss.insertSheet("Staff");
        sheet.appendRow(["ID", "Name", "Role", "Department"]);
      }
      const id = Utilities.getUuid();
      sheet.appendRow([id, postData.Name, postData.Role, postData.Department]);
      return ContentService.createTextOutput(JSON.stringify({ status: "success", id: id }))
        .setMimeType(ContentService.MimeType.JSON);
    } 
    
    // --- Action: Delete Staff ---
    else if (action === "deleteStaff") {
      const sheet = ss.getSheetByName("Staff");
      if (!sheet) return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Staff sheet not found" })).setMimeType(ContentService.MimeType.JSON);
      
      const data = sheet.getDataRange().getValues();
      let deleted = false;
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === postData.ID) {
          sheet.deleteRow(i + 1);
          deleted = true;
          break;
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ status: deleted ? "success" : "error", message: deleted ? "" : "ID not found" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // --- Action: Add Shift ---
    else if (action === "addShift") {
      let sheet = ss.getSheetByName("Nurse-Shifts");
      if (!sheet) {
        sheet = ss.insertSheet("Nurse-Shifts");
        sheet.appendRow(["Name", "Date", "ShiftType"]);
      }
      sheet.appendRow([postData.Name, postData.Date, postData.ShiftType]);
      return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // --- Action: Unknown ---
    else {
      return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Unknown action: " + action }))
        .setMimeType(ContentService.MimeType.JSON);
    }

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}