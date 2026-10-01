/*
  Command: Kn-tg
  Description: Telegram numbers country list
*/

var target_chat_id = (chat && chat.chatid) ? chat.chatid : user.telegramid;

var text = "📢 *اختر دولة لشراء رقم تيليجرام (Telegram):*\n\n" +
  "اختر الدولة وسيقوم البوت بطلب الرقم لك فورياً ↘️";

var keyboard = [
  [
    { text: "روسيا 🇷🇺 ¦ 15 ₽", callback_data: "Xi tg russia" },
    { text: "أوكرانيا 🇺🇦 ¦ 16 ₽", callback_data: "Xi tg ukraine" }
  ],
  [
    { text: "كازاخستان 🇰🇿 ¦ 18 ₽", callback_data: "Xi tg kazakhstan" },
    { text: "إندونيسيا 🇮🇩 ¦ 12 ₽", callback_data: "Xi tg indonesia" }
  ],
  [
    { text: "👑 سيرفر موقع محمد المخصص (تيليجرام)", callback_data: "buy_mohammed tg" }
  ],
  [
    { text: "- رجوع 🔙", callback_data: "Buynum" }
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
