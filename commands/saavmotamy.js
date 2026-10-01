/*
  Command: saavmotamy
  Description: Most popular VIP servers
*/

var target_chat_id = (chat && chat.chatid) ? chat.chatid : user.telegramid;

var text = "🐻 *ـ مرحباً عزيزي العميل* ،\n\n" +
  "هذا القسم مخصّص للسيرفرات الأكثر طلباً وشراءً *للواتساب ، والتيليجرام* ، يرجى إختيار أحد السيرفرات في الأسفل ، *كل سيرفر يحتوي على عدة دول ذات سعر رخيص وجودة مضمونة جداً* ✅.";

var keyboard = [
  [
    { text: "🐬 - سيرفر واتسأب كولومبيا (15 ₽)", callback_data: "Xi wa colombia 15" },
    { text: "🍂 - سيرفر تيليجرام كولومبيا (10 ₽)", callback_data: "Xi tg colombia 10" }
  ],
  [
    { text: "🐬 - سيرفر واتسأب ألبانيا (15 ₽)", callback_data: "Xi wa albania 15" },
    { text: "🍂 - سيرفر تيليجرام مصر (15 ₽)", callback_data: "Xi tg egypt 15" }
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
