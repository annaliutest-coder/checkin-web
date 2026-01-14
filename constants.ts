
export const ADMIN_EMAIL = 'xinyiliu@ntnu.edu.tw'; // 後端管理與發信帳號
export const PUBLIC_CONTACT_EMAIL = 'clc@ntnu.edu.tw'; // 前端顯示的聯絡信箱

// 已更新為實際部署的網址
export const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxIMOV23va8FoYsPRRuu4hSlxs9_ucVfkWtOdmUAhk3BI3Azf1GkJvbzOHMpvUV843pHA/exec';

export const GOOGLE_APPS_SCRIPT_CODE = `
/**
 * 國立臺灣師範大學華語系 - 智慧打卡自動回信系統
 * 功能：1. 紀錄至試算表 2. 通知系辦 3. 發送歡迎信給學生
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000); // 防止多人同時打卡造成當機
  
  try {
    // 解析前端傳來的 JSON 資料
    var data = JSON.parse(e.postData.contents);
    var studentEmail = data.email;
    var time = data.timestamp;
    var adminEmail = "${ADMIN_EMAIL}"; // 指定管理員信箱
    
    // 1. 紀錄到 Google 試算表
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheets()[0];
    sheet.appendRow([time, studentEmail, "已發送歡迎信"]);
    
    // 2. 發送通知給系辦管理員
    MailApp.sendEmail({
      to: adminEmail,
      subject: "【重要通知】新學生已完成打卡簽到：" + studentEmail,
      body: "您好：\\n\\n有一位學生已透過網頁完成線上打卡。\\n\\n詳細資訊：\\n時間：" + time + "\\n學生 Email：" + studentEmail + "\\n\\n系統已同步自動發送「國際與文化組」申請資訊至該位學生的信箱。"
    });

    // 3. 發送正式歡迎信給學生
    var subject = "【師大華語文教學系CSL】歡迎申請師大華語系國際與文化組";
    var body = "親愛的同學您好：\\n\\n" +
      "我們已經收到您的打卡資訊，以下是您感興趣的相關申請連結：\\n\\n" +
      "🔹 NTNU外國學生入學申請網站：https://bds.oia.ntnu.edu.tw/bds/apply \\n" +
      "🔹 華語系國華組介紹：\\n" +
      "   https://www.tcsl.ntnu.edu.tw/index.php/enroll/bachelor/clc/ \\n\\n" +
      "有什麼問題，歡迎寫信給我們 ${PUBLIC_CONTACT_EMAIL}。\\n\\n" +
      "國立臺灣師範大學 華語文教學系 敬上";

    MailApp.sendEmail({
      to: studentEmail,
      subject: subject,
      body: body,
      replyTo: adminEmail // 學生點擊回覆會導向您的管理信箱
    });
    
    return ContentService.createTextOutput(JSON.stringify({ "status": "success" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
`;
