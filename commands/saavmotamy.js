/*
  Command: saavmotamy
  Description: Most popular VIP servers
*/

var target_chat_id = (chat && chat.chatid) ? chat.chatid : user.telegramid;

var text = "🐻 *ـ مرحباً عزيزي العميل* ،\n\n" +
  "هذا القسم مخصّص للسيرفرات الأكثر طلباً وشراءً *للواتساب ، والتيليجرام* ، يرجى إختيار أحد السيرفرات في الأسفل ، *كل سيرفر يحتوي على عدة دول ذات سعر رخيص وجودة مضمونة جداً* ✅.";

var keyboard = [
  [
    { text: "👑 سيرفر موقع محمد المخصص (الأعلى سرعة)", callback_data: "buy_mohammed" }
  ],
  [
    { text: "🐬 - سيرفر واتسأب الملكي المُـمـيز ⭐️", callback_data: "offers_wa" },
    { text: "🍂 - سيرفر تيليجرام الملكي المُـمـيز ⭐️", callback_data: "offers_tg" }
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
