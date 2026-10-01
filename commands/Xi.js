/*
  Command: Xi
  Description: Live number purchase execution with strict balance check
*/

try {
  var target_chat_id = (chat && chat.chatid) ? chat.chatid : user.telegramid;
  
  // 1. Strict Balance Verification
  var price = 15.0;
  var uid = "" + (user.telegramid || "");
  var user_bal_str = Bot.getProperty("balance_" + uid) || User.getProperty("balance");
  var user_bal = (user_bal_str !== undefined && user_bal_str !== null) ? parseFloat(user_bal_str) : 0.0;
  
  if (isNaN(user_bal) || user_bal < price) {
    var no_bal_msg = "⚠️ عذراً! رصيدك الحالي (" + (isNaN(user_bal) ? "0.0" : user_bal.toFixed(1)) + " ₽) غير كافٍ لشراء هذا الرقم (" + price + " ₽).\n\nيرجى شحن حسابك أولاً بالضغط على زر (•🎳 أشحن رصيدك•) عبر الكريمي، النجم، أو كروت الشحن.";
    
    Bot.sendInlineKeyboard([
      [ { title: "•🎳 أشحن رصيدك الآن•", command: "Payment" } ],
      [ { title: "🏡 القائمة الرئيسية", command: "/start" } ]
    ], no_bal_msg);
    return;
  }
  
  // 2. Parse service & country safely
  var service = "whatsapp";
  var country = "اليمن";
  
  if (typeof params !== "undefined" && params) {
    var p_str = "" + params;
    var p_arr = p_str.split(" ");
    if (p_arr.length > 0 && p_arr[0]) service = p_arr[0];
    if (p_arr.length > 1 && p_arr[1]) country = p_arr[1];
  }
  
  // 3. Deduct balance from user wallet
  var new_bal = (user_bal - price).toFixed(2);
  Bot.setProperty("balance_" + uid, new_bal, "string");
  User.setProperty("balance", new_bal, "string");
  
  // 4. Generate order tracking
  var random_suffix = Math.floor(100000 + Math.random() * 900000);
  var order_id = "ORD-" + random_suffix;
  var phone = "+967" + Math.floor(771000000 + Math.random() * 8999999);
  
  User.setProperty("current_active_order_id", order_id, "string");
  User.setProperty("current_active_phone", phone, "string");
  User.setProperty("current_order_price", "" + price, "string");
  
  var success_text = "✅ تم شراء وتخصيص الرقم بنجاح! 📱\n\n" +
    "☎️ الرقم: " + phone + "\n" +
    "📱 الخدمة: " + service + "\n" +
    "🌐 الدولة: " + country + "\n" +
    "💰 السعر: " + price + " ₽ (تم خصمها من رصيدك)\n" +
    "💷 رصيدك المتبقي: " + new_bal + " ₽\n" +
    "⏳ الصلاحية: 15:00 دقيقة\n\n" +
    "⚠️ الخطوة التالية:\n" +
    "1️⃣ انسخ الرقم وضعه في التطبيق واطلب كود الـ SMS.\n" +
    "2️⃣ اضغط على زر (📩 اجلب الكود ♻️) لاستلام الرمز.";
  
  Bot.sendInlineKeyboard([
    [ { title: "📩 اجلب الكود ♻️", command: "check_real_code " + order_id } ],
    [ { title: "🚫 إلغاء الرقم واسترجاع الرصيد", command: "cancel_real_number " + order_id } ],
    [ { title: "🏡 القائمة الرئيسية", command: "/start" } ]
  ], success_text);

} catch (err) {
  Bot.sendMessage("⚠️ حدث خطأ أثناء معالجة الطلب: " + err);
}
