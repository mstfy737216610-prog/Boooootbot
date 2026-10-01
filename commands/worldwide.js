/*
  Command: worldwide
  Description: Most available servers
*/

var target_chat_id = (chat && chat.chatid) ? chat.chatid : user.telegramid;

var text = "🎲 *- سيرفرات الأرقام الأكثر توفراً وسرعة* 🌐\n\n" +
  "*- إضغط على أحد السيرفرات بالأسفل* للشراء الفعلي المباشر من الموقع 💰";

var keyboard = [
  [
    { text: "♻️ سيرفر [ WhatsApp ] كولومبيا (15 ₽)", callback_data: "Xi wa colombia 15" }
  ],
  [
    { text: "♻️ سيرفر [ WhatsApp ] ألبانيا VIP (15 ₽)", callback_data: "Xi wa albania 15" }
  ],
  [
    { text: "♻️ سيرفر [ Telegram ] كولومبيا ($0.10) (10 ₽)", callback_data: "Xi tg colombia 10" }
  ],
  [
    { text: "♻️ سيرفر [ Telegram ] مصر توفر عالي (15 ₽)", callback_data: "Xi tg egypt 15" }
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
