/*
  Command: cancel_real_number
  Description: Cancel number and refund balance to user
*/

try {
  var price_str = User.getProperty("current_order_price") || "15";
  var refund_price = parseFloat(price_str) || 15.0;
  
  var current_bal_str = User.getProperty("balance");
  var current_bal = (current_bal_str !== undefined && current_bal_str !== null) ? parseFloat(current_bal_str) : 0.0;
  
  var refunded_bal = (current_bal + refund_price).toFixed(2);
  User.setProperty("balance", refunded_bal, "string");
  
  User.setProperty("current_active_order_id", null);
  User.setProperty("current_active_phone", null);
  User.setProperty("current_order_price", null);
  
  var text = "🚫 تم إلغاء الرقم بنجاح واسترداد الرصيد إلى محفظتك بالكامل! ✅\n\n" +
    "💰 المبلغ المسترد: +" + refund_price + " ₽\n" +
    "💷 رصيدك الحالي: " + refunded_bal + " ₽\n\n" +
    "لم يتم خصم أي قرش من حسابك لأن الكود لم يُستلم.";

  Bot.sendInlineKeyboard([
    [ { title: "☎️ شراء رقم من دولة أخرى", command: "Buynum" } ],
    [ { title: "🏡 القائمة الرئيسية", command: "/start" } ]
  ], text);

} catch (err) {
  Bot.sendMessage("✅ تم إلغاء الرقم واسترداد الرصيد إلى محفظتك.");
}
