
export const TARGET_EMAIL = 'xinyiliu@ntnu.edu.tw';

// 注意：請將此網址替換為您在 Google Apps Script 部署後獲得的「網頁應用程式 URL」
export const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';

export const GOOGLE_APPS_SCRIPT_CODE = `
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    var email = data.email;
    var timestamp = data.timestamp;
    
    // 1. 紀錄至 Google Sheet
    sheet.appendRow([timestamp, email]);
    
    // 2. 發送通知郵件
    MailApp.sendEmail({
      to: "xinyiliu@ntnu.edu.tw",
      subject: "【師大打卡】學生報到: " + email,
      body: "學生 " + email + " 已於 " + timestamp + " 完成打卡。\\n\\n系統自動發送，請勿直接回覆。"
    });
    
    return ContentService.createTextOutput(JSON.stringify({ "status": "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
`;
