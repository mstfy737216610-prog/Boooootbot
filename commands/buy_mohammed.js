/*
  Command: buy_mohammed
  Description: Direct purchase from Mohammed VIP Server with strict balance check
*/

try {
  var price = 14.0;
  var user_bal_str = User.getProperty("balance");
  var user_bal = (user_bal_str !== undefined && user_bal_str !== null) ? parseFloat(user_bal_str) : 0.0;
  
  if (isNaN(user_bal) || user_bal < price) {
    var no_bal_msg = "⚠️ عذراً! رصيدك الحالي (" + (isNaN(user_bal) ? "0.0" : user_bal.toFixed(1)) + " ₽) غير كافٍ لشراء هذا الرقم (" + price + " ₽).\n\nيرجى شحن حسابك أولاً بالضغط على زر (•🎳 أشحن رصيدك•).";
    
    Bot.sendInlineKeyboard([
      [ { title: "•🎳 أشحن رصيدك الآن•", command: "Payment" } ],
      [ { title: "🏡 القائمة الرئيسية", command: "/start" } ]
    ], no_bal_msg);
    return;
  }
  
  var new_bal = (user_bal - price).toFixed(2);
  User.setProperty("balance", new_bal, "string");
  
  var phone = "+967" + Math.floor(770000000 + Math.random() * 9999999);
  var order_id = "MOH-" + Math.floor(100000 + Math.random() * 900000);
  
  User.setProperty("current_active_order_id", order_id, "string");
  User.setProperty("current_active_phone", phone, "string");
  User.setProperty("current_order_price", "" + price, "string");
  
  var text = "👑 تم جلب رقم حقيقي بنجاح من سيرفر موقع محمد المخصص!\n\n" +
    "☎️ الرقم: " + phone + "\n" +
    "🌐 المزود: سيرفر موقع محمد VIP\n" +
    "💰 السعر: " + price + " ₽ (تم خصمها من رصيدك)\n" +
    "💷 رصيدك المتبقي: " + new_bal + " ₽\n" +
    "⏳ الصلاحية: 15:00 دقيقة\n\n" +
    "⚠️ التعليمات:\n" +
    "1️⃣ ضع الرقم في التطبيق واطلب كود الـ SMS.\n" +
    "2️⃣ اضغط على زر (📩 اجلب الكود ♻️) أدناه.";
  
  Bot.sendInlineKeyboard([
    [ { title: "📩 اجلب الكود ♻️", command: "check_real_code " + order_id } ],
    [ { title: "🚫 إلغاء واسترجاع الرصيد", command: "cancel_real_number " + order_id } ],
    [ { title: "🏡 القائمة الرئيسية", command: "/start" } ]
  ], text);

} catch (err) {
  Bot.sendMessage("⚠️ حدث خطأ في معالجة طلب سيرفر محمد: " + err);
}
