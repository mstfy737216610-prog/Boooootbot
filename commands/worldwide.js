/*
  Command: worldwide
  Description: Most available servers
*/

var target_chat_id = (chat && chat.chatid) ? chat.chatid : user.telegramid;

var text = "🎲 *- سيرفرات الأرقام الأكثر توفراً وسرعة* 🌐\n\n" +
  "*- إضغط على أحد السيرفرات بالأسفل* للشراء الفوري من دولة متاحة فورياً بدون انتظار 💰";

var keyboard = [
  [
    { text: "♻️ سيرفر [ WhatsApp ] الأكثر توفراً (10 ₽)", callback_data: "Xi-wa-indonesia" }
  ],
  [
    { text: "♻️ سيرفر [ WhatsApp ] VIP مضمون (16 ₽)", callback_data: "Xi-wa-russia" }
  ],
  [
    { text: "♻️ سيرفر [ Telegram ] سريع (15 ₽)", callback_data: "Xi-tg-russia" }
  ],
  [
    { text: "👑 سيرفر موقع محمد الحصري (أعلى توفر)", callback_data: "buy_mohammed" }
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
