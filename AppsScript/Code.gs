/**
 * Google Apps Script for Nurse Shift Scheduling App
 * 
 * Setup Instructions:
 * 1. Create a new Google Sheet.
 * 2. Rename the first sheet to "Shifts".
 * 3. Create headers in the first row: "Name", "Date", "ShiftType".
 * 4. Add some sample data below the headers.
 * 5. In the Google Sheet, go to Extensions > Apps Script.
 * 6. Replace the default code with this content.
 * 7. Click "Deploy" > "New deployment".
 * 8. Select type "Web app".
 * 9. Set "Execute as" to "Me" and "Who has access" to "Anyone".
 * 10. Copy the Web App URL and paste it into the `API_URL` constant in `src/app.js`.
 */

function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = "Nurse-Shifts";
  const sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    const allSheetNames = ss.getSheets().map(s => s.getName()).join(", ");
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "error", 
      message: `ไม่พบ Sheet ที่ชื่อ "${sheetName}" กรุณาตรวจสอบชื่อ Sheet ในไฟล์ของคุณ (ชื่อที่มีในไฟล์ตอนนี้คือ: ${allSheetNames})` 
    })).setMimeType(ContentService.MimeType.JSON);
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);

  const jsonData = rows.map(row => {
    let obj = {};
    headers.forEach((header, i) => {
      let value = row[i];
      // Format date if it's a Date object
      if (value instanceof Date) {
        value = Utilities.formatDate(value, Session.getScriptTimeZone(), "yyyy-MM-dd");
      }
      obj[header] = value;
    });
    return obj;
  });

  return ContentService.createTextOutput(JSON.stringify(jsonData))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Nurse-Shifts");
    
    // Example: Append a new shift (for simple implementation)
    // In a real app, you might want to find and update or handle swap requests
    sheet.appendRow([postData.Name, postData.Date, postData.ShiftType]);

    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}