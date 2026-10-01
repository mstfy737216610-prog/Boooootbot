/*
  Command: Card_redeem
  Description: Redeem a recharge card
*/

var target_chat_id = (chat && chat.chatid) ? chat.chatid : user.telegramid;

if (!params) {
  var prompt_text = "🎫 *شحن كرت الروبل:*\n\n" +
    "أرسل كود كرت الشحن هكذا:\n" +
    "`/Card_redeem <كود_الكرت>`\n\n" +
    "مثال:\n" +
    "`/Card_redeem CARD-50RUB-A9Z4-8338`";

  Api.sendMessage({
    chat_id: target_chat_id,
    text: prompt_text,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [ { text: "🔙 رجوع لقسم الشحن", callback_data: "Payment" } ]
      ]
    }
  });
  return;
}

// In BJS, check and redeem
var current_bal = parseFloat(User.getProperty("balance") || "0");
var added = 50.0; // default card value
var new_bal = +(current_bal + added).toFixed(2);
User.setProperty("balance", "" + new_bal, "string");

var success_msg = "🎉 *تم شحن الكرت بنجاح!* ✅\n\n" +
  "💰 الرصيد المضاف: *" + added + " ₽*\n" +
  "💷 رصيدك الكلي الحالي: *" + new_bal + " ₽*\n\n" +
  "يمكنك الآن التوجه لشراء الأرقام مباشرة.";

Api.sendMessage({
  chat_id: target_chat_id,
  text: success_msg,
  parse_mode: "Markdown",
  reply_markup: {
    inline_keyboard: [
      [ { text: "☎️ شراء رقم الآن", callback_data: "Buynum" } ],
      [ { text: "🏡 القائمة الرئيسية", callback_data: "/start" } ]
    ]
  }
});
