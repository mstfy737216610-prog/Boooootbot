/*
  Command: SendCoin
  Description: Transfer ruble balance between users
*/

var target_chat_id = (chat && chat.chatid) ? chat.chatid : user.telegramid;
var user_id = "" + (user.telegramid || "");

// 1. Get raw input
var raw = "" + (params || "");
if (!raw && typeof message !== "undefined" && message) {
  raw = "" + message;
}

var numbers = raw.match(/\d+(\.\d+)?/g);

if (!numbers || numbers.length < 2) {
  var text = "• *تحويل الرصيد 🔄*\n\n" +
    "تستطيع تحويل الرصيد إلى أي حساب أو صديق بالبوت فورياً وبدون أي عمولة (0%).\n\n" +
    "لتحويل الرصيد أرسل الأمر هكذا:\n" +
    "`/SendCoin <Telegram_ID> <المبلغ>`\n\n" +
    "مثال:\n" +
    "`/SendCoin 8338869162 20`\n" +
    "`/SendCoin 7607633343 50`\n\n" +
    "⚠️ أقل مبلغ للتحويل هو `5.00 ₽`.";

  var keyboard = [
    [ { text: "- رجوع 🔙", callback_data: "/start" } ]
  ];

  Api.sendMessage({
    chat_id: target_chat_id,
    text: text,
    parse_mode: "Markdown",
    reply_markup: { inline_keyboard: keyboard }
  });
  return;
}

var n1 = numbers[0];
var n2 = numbers[1];
var to_id = "";
var amt = 0;

if (n1.length >= 7 && n2.length < 7) {
  to_id = n1;
  amt = parseFloat(n2) || 0;
} else if (n2.length >= 7 && n1.length < 7) {
  to_id = n2;
  amt = parseFloat(n1) || 0;
} else {
  to_id = n1;
  amt = parseFloat(n2) || 0;
}

// Check sender balance
var my_bal_str = Bot.getProperty("balance_" + user_id) || User.getProperty("balance") || "0";
var my_bal = parseFloat(my_bal_str) || 0.0;

if (amt < 5) {
  Bot.sendMessage("❌ أقل مبلغ مسموح بتحويله هو 5 روبل.");
  return;
}

if (my_bal < amt) {
  Bot.sendMessage("❌ رصيدك الحالي (" + my_bal + " ₽) لا يكفي لإتمام عملية التحويل بمبلغ " + amt + " ₽.");
  return;
}

// Deduct from sender
var remaining = +(my_bal - amt).toFixed(2);
Bot.setProperty("balance_" + user_id, "" + remaining, "string");
User.setProperty("balance", "" + remaining, "string");

// Credit receiver
var rec_bal_str = Bot.getProperty("balance_" + to_id) || "0";
var rec_bal = parseFloat(rec_bal_str) || 0.0;
var rec_new = +(rec_bal + amt).toFixed(2);
Bot.setProperty("balance_" + to_id, "" + rec_new, "string");

Bot.sendMessage("✅ *تم تحويل " + amt + " ₽ بنجاح* إلى الحساب `" + to_id + "`.\nرصيدك المتبقي: *" + remaining + " ₽*", {
  parse_mode: "Markdown"
});

try {
  Api.sendMessage({
    chat_id: to_id,
    text: "🎉 *وصلك تحويل رصيد جديد!*\n\nالمبلغ المستلم: *" + amt + " ₽* من العضو `" + user.telegramid + "`.",
    parse_mode: "Markdown"
  });
} catch(e) {}
