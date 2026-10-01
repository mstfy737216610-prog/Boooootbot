/*
  Command: Payment
  Description: Recharge and payment options
*/

var admin_id = "8338869162";
var target_chat_id = (chat && chat.chatid) ? chat.chatid : user.telegramid;

var text = "🎳 *- طرق شحن رصيدك بالروبل في البوت:*\n\n" +
  "🏦 *بنك الكريمي (حساب / جوال):*\n" +
  "└ الحساب: `3049582109`\n\n" +
  "💸 *النجم للصرافة والتحويلات:*\n" +
  "└ باسم: `محمد علي سالم`\n\n" +
  "🪙 *بينانس وبايير USDT:*\n" +
  "└ Binance Pay ID: `394850211`\n\n" +
  "🇸🇦 *STC Pay والراجحي (السعودية):*\n" +
  "└ الرقم: `+966500000000`\n\n" +
  "🇮🇶 *آسياسيل وزين كاش (العراق):*\n" +
  "└ الرقم: `07700000000`\n\n" +
  "🎫 *لديك كرت شحن؟* اضغط على زر (شحن كرت) بالأسفل لإدخال الكود وشحن رصيدك فورياً!";

var keyboard = [
  [
    { text: "🎫 شحن كرت شحن فوري", callback_data: "Card_redeem" },
    { text: "💬 مراسلة الدعم لشحن الحساب", url: "tg://user?id=" + admin_id }
  ],
  [
    { text: "- رجوع 🔙", callback_data: "/start" }
  ]
];

try {
  Api.sendMessage({
    chat_id: target_chat_id,
    text: text,
    parse_mode: "Markdown",
    reply_markup: { inline_keyboard: keyboard }
  });
} catch(e) {
  Bot.sendInlineKeyboard(keyboard, text);
}
