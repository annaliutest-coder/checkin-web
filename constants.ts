
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
    
    // 2. 發送通知郵件給管理員 (xinyiliu@ntnu.edu.tw)
    MailApp.sendEmail({
      to: "xinyiliu@ntnu.edu.tw",
      subject: "【師大打卡通知】新學生諮詢: " + email,
      body: "學生 " + email + " 已於 " + timestamp + " 完成打卡，對國華組有興趣。\\n\\n系統已自動發送歡迎信給該位學生。"
    });

    // 3. 發送歡迎信給學生
    var studentSubject = "【國立臺灣師範大學華語系】歡迎申請國華組 (International Student Group)";
    var studentBody = "親愛的同學您好：\\n\\n" +
      "非常高興得知您對國立臺灣師範大學華語文教學系「國華組 (International Student Group)」感興趣！\\n\\n" +
      "師大華語系擁有全球頂尖的師資與教學資源，是您展開華語學習與專業發展的最佳選擇。我們誠摯歡迎您的加入！\\n\\n" +
      "以下是您可能需要的申請資訊：\\n\\n" +
      "● 官方申請網站：https://bds.oia.ntnu.edu.tw/bds/apply \\n" +
      "● 華語系國華組詳細介紹：https://www.tcsl.ntnu.edu.tw/index.php/enroll/bachelor/clc/ \\n\\n" +
      "若您有任何關於申請流程或課程的問題，歡迎隨時回覆此信件或連繫系辦。\\n\\n" +
      "祝您 申請順利！\\n\\n" +
      "國立臺灣師範大學 華語文教學系 敬上";

    MailApp.sendEmail({
      to: email,
      subject: studentSubject,
      body: studentBody
    });
    
    return ContentService.createTextOutput(JSON.stringify({ "status": "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
`;
