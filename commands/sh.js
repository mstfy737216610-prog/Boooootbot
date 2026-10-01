/*
  Command: sh
  Description: Social media boost and extra services
*/

var admin_id = "8338869162";
var target_chat_id = (chat && chat.chatid) ? chat.chatid : user.telegramid;

var text = "🔭 *- الرشـ%ـق وشحن الألعاب والبرامج:*\n\n" +
  "• زيادة متابعين إنستقرام وتيك توك وتيليجرام 👥\n" +
  "• شحن شدات ببجي وجواهر فري فاير 🎮\n" +
  "• توثيق وتفعيل اشتراكات تيليجرام بريميوم ⭐\n\n" +
  "لطلب أي خدمة مباشرة تواصل مع الإدارة:";

var keyboard = [
  [
    { text: "💬 مراسلة الإدارة للطلب", url: "tg://user?id=" + admin_id }
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
