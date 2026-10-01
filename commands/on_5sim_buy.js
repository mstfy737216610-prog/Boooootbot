/*
  Command: on_5sim_buy
  Description: Callback when 5SIM API responds with purchased number
*/

var parts = ("" + (params || "")).trim().split(/\s+/);
var price = parseFloat(parts[0]) || 15.0;
var country = parts[1] || "الدولة المحددة";
var service = parts[2] || "التطبيق";
var uid = "" + (user.telegramid || "");

try {
  var data = null;
  if (typeof content !== "undefined" && content) {
    try {
      data = JSON.parse(content);
    } catch(pe) {
      data = null;
    }
  }

  // 1. Success: Real number allocated on 5sim!
  if (data && data.phone && data.id) {
    var real_phone = "" + data.phone;
    var order_id = "" + data.id;

    // Deduct user balance ONLY on verified purchase
    var cur_bal = parseFloat(Bot.getProperty("balance_" + uid) || User.getProperty("balance") || "0");
    var new_bal = +(Math.max(0, cur_bal - price)).toFixed(2);
    Bot.setProperty("balance_" + uid, "" + new_bal, "string");
    User.setProperty("balance", "" + new_bal, "string");

    // Save active order details
    User.setProperty("current_active_order_id", order_id, "string");
    User.setProperty("current_active_phone", real_phone, "string");
    User.setProperty("current_order_price", "" + price, "string");
    User.setProperty("current_order_country", country, "string");
    User.setProperty("current_order_service", service, "string");

    var success_text = "✅ *تم شراء وتخصيص الرقم الحقيقي بنجاح من الموقع!* 📱\n\n" +
      "☎️ *الرقم الفعلي:* `" + real_phone + "`\n" +
      "🆔 *رقم الطلب في 5sim:* `#" + order_id + "`\n" +
      "📱 *الخدمة:* *" + service.toUpperCase() + "*\n" +
      "🌐 *الدولة:* *" + country + "*\n" +
      "💰 *السعر:* *" + price + " ₽* (تم خصمها من رصيدك)\n" +
      "💷 *رصيدك المتبقي:* *" + new_bal + " ₽*\n" +
      "⏳ *الصلاحية:* `15:00 دقيقة`\n\n" +
      "⚠️ *الخطوة التالية الهامة:*\n" +
      "1️⃣ انسخ الرقم وضعه في التطبيق (واتساب أو تيليجرام) واطلب كود الـ SMS.\n" +
      "2️⃣ بعد أن تطلب الكود في التطبيق، اضغط على زر (📩 اجلب الكود ♻️) بالأسفل لاستلام رمز التحقق الفعلي.";

    Bot.sendInlineKeyboard([
      [ { title: "📩 اجلب الكود ♻️", command: "check_real_code " + order_id } ],
      [ { title: "🚫 إلغاء الرقم واسترجاع الرصيد", command: "cancel_real_number " + order_id } ],
      [ { title: "🏡 القائمة الرئيسية", command: "/start" } ]
    ], success_text);
    return;
  }

  // 2. Error from provider (e.g. no numbers or balance)
  var err_raw = (data && data.error) ? data.error : ("" + (content || ""));
  var no_num = (err_raw.indexOf("no free phones") !== -1 || err_raw.indexOf("NO_NUMBERS") !== -1 || err_raw.indexOf("no product") !== -1);
  var no_bal = (err_raw.indexOf("not enough") !== -1 || err_raw.indexOf("balance") !== -1);

  if (no_num) {
    var no_num_msg = "❌ *لم يتم تنفيذ الطلب*\n\n" +
      "نظراً لعدم توفر أرقام حالياً في موقع التوريد لدولة *" + country + "* لتطبيق *" + service + "*.\n\n" +
      "🛡 *لم يتم خصم أي قرش من رصيدك!*\n" +
      "💡 جرب اختيار دولة أخرى متوفرة بكثرة مثل (كولومبيا 🇨🇴 أو مصر 🇪🇬 أو ألبانيا 🇦🇱).";

    Bot.sendInlineKeyboard([
      [ { title: "☎️ اختيار دولة أخرى", command: "Buynum" } ],
      [ { title: "🏡 القائمة الرئيسية", command: "/start" } ]
    ], no_num_msg);
    return;
  }

  if (no_bal) {
    Bot.sendMessage("⚠️ رصيد حساب التوريد في الموقع غير كافٍ حالياً. تم إشعار الإدارة ولم يتم خصم أي رصيد من محفظتك.");
    return;
  }

  Bot.sendMessage("⚠️ تعذر إتمام الشراء من الموقع: " + err_raw + "\nلم يتم خصم أي رصيد من حسابك.");

} catch(err) {
  Bot.sendMessage("⚠️ حدث خطأ أثناء معالجة رد المزود: " + err);
}
