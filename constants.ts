
export const TARGET_EMAIL = 'xinyiliu@ntnu.edu.tw';

// This is the placeholder for your Google Apps Script URL
// To get this: 
// 1. Create a Google Sheet.
// 2. Extensions -> Apps Script.
// 3. Paste the provided backend code.
// 4. Deploy as Web App (Anyone can access).
// 5. Replace this URL.
export const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyEiX6rIeiP-hY3AjWK8RW0pM6LwiCIZytzbZDHZPO7Bek0_cw0u7Kb8bUwA93rMmmvoQ/exec';

export const GOOGLE_APPS_SCRIPT_CODE = `
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  var email = data.email;
  var timestamp = data.timestamp;
  
  // 1. Save to Google Sheet
  sheet.appendRow([timestamp, email]);
  
  // 2. Send Notification Email
  MailApp.sendEmail({
    to: "xinyiliu@ntnu.edu.tw",
    subject: "學生打卡通知: " + email,
    body: "學生 " + email + " 已於 " + timestamp + " 完成打卡。"
  });
  
  return ContentService.createTextOutput(JSON.stringify({ "status": "success" }))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
