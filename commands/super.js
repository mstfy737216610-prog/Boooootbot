/*
  Command: super
  Description: Support contact
*/

var admin_id = "8338869162";
var target_chat_id = (chat && chat.chatid) ? chat.chatid : user.telegramid;

var text = "الدعم ⏰\n\n" +
  "أهلاً بك عزيزي في قسم الدعم الفني المباشر لبوت الأرقام 💬\n\n" +
  "• للاستفسار عن الشحن أو الرصيد\n" +
  "• لمشاكل وصول كود الـ SMS\n" +
  "• لطلب كميات وتخفيضات خاصة للموزعين\n\n" +
  "تواصل مباشرة مع المالك عبر الزر أدناه ↘️";

var keyboard = [
  [
    { text: "💬 مراسلة المالك مباشرة 👨‍💻", url: "tg://user?id=" + admin_id }
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
