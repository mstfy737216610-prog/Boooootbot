/*
  Command: Kn-wa
  Description: WhatsApp numbers country list
*/

var target_chat_id = (chat && chat.chatid) ? chat.chatid : user.telegramid;

var text = "💬 *اختر دولة لشراء رقم واتساب (WhatsApp):*\n\n" +
  "اختر الدولة وسيقوم البوت بطلب الرقم لك فورياً عبر السيرفر الفعلي ↘️";

var keyboard = [
  [
    { text: "اليمن 🇾🇪 ¦ 20 ₽", callback_data: "Xi wa yemen" },
    { text: "السعودية 🇸🇦 ¦ 35 ₽", callback_data: "Xi wa saudi" }
  ],
  [
    { text: "روسيا 🇷🇺 ¦ 15 ₽", callback_data: "Xi wa russia" },
    { text: "أوكرانيا 🇺🇦 ¦ 16 ₽", callback_data: "Xi wa ukraine" }
  ],
  [
    { text: "إندونيسيا 🇮🇩 ¦ 10 ₽", callback_data: "Xi wa indonesia" },
    { text: "مصر 🇪🇬 ¦ 15 ₽", callback_data: "Xi wa egypt" }
  ],
  [
    { text: "👑 سيرفر موقع محمد المخصص (واتساب)", callback_data: "buy_mohammed wa" }
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
