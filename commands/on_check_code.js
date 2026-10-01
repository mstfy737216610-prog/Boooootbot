/*
  Command: on_check_code
  Description: Callback when checking SMS code on 5SIM
*/

var order_id = ("" + (params || "")).trim() || User.getProperty("current_active_order_id") || "";
var phone = User.getProperty("current_active_phone") || "";

try {
  var data = null;
  if (typeof content !== "undefined" && content) {
    try {
      data = JSON.parse(content);
    } catch(pe) {
      data = null;
    }
  }

  // Check if real SMS has arrived from WhatsApp/Telegram
  if (data && data.sms && Array.isArray(data.sms) && data.sms.length > 0) {
    var sms = data.sms[0];
    var code = sms.code || sms.text;

    var text = "🎉 *تم استلام كود التفعيل الحقيقي من التطبيق بنجاح!* ✅\n\n" +
      "☎️ *الرقم:* `" + phone + "`\n" +
      "💬 *كود التحقق (OTP):* `" + code + "`\n\n" +
      "📜 *نص الرسالة الواردة:*\n`" + (sms.text || code) + "`\n\n" +
      "👉 *إضغط على الكود لنسخه ووضعه في التطبيق مباشرة.*";

    Bot.sendInlineKeyboard([
      [ { title: "☎️ شراء رقم جديد", command: "Buynum" } ],
      [ { title: "🏡 القائمة الرئيسية", command: "/start" } ]
    ], text);
    return;
  }

  // If no SMS yet
  var wait_text = "⏳ *الكود لم يصل من التطبيق بعد!*\n\n" +
    "☎️ *الرقم الحالي:* `" + phone + "`\n\n" +
    "⚠️ *تأكد من الآتي:*\n" +
    "1️⃣ أنك قمت بنسخ الرقم ووضعه في تطبيق الواتساب أو التيليجرام.\n" +
    "2️⃣ أنك ضغطت على زر (إرسال رسالة نصية SMS) داخل التطبيق.\n" +
    "3️⃣ انتظر 10 إلى 20 ثانية ثم اضغط على زر (📩 اجلب الكود ♻️) بالأسفل للتحقق مجدداً.";

  Bot.sendInlineKeyboard([
    [ { title: "📩 اجلب الكود ♻️ (إعادة المحاولة)", command: "check_real_code " + order_id } ],
    [ { title: "🚫 الرقم محظور / إلغاء واسترجاع الرصيد", command: "cancel_real_number " + order_id } ],
    [ { title: "🏡 القائمة الرئيسية", command: "/start" } ]
  ], wait_text);

} catch (err) {
  Bot.sendMessage("⚠️ جاري فحص وصول الكود... يرجى إعادة الضغط خلال ثوانٍ.");
}
