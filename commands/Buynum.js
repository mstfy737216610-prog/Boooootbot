/*
  Command: Buynum
  Description: Select application to purchase a virtual number
*/

var target_chat_id = (chat && chat.chatid) ? chat.chatid : user.telegramid;

var text = "☑️ - *يرجى إختيار التطبيق* الذي تريد *شراء رقم وهمي* لتفعيله 🎥\n\n" +
  "🔺 - يمكنك إختيار *السيرفر العام* أو *سيرفر موقع محمد المخصص* لشراء رقم يستقبل الكود فورياً *وبسعر مناسب وجودة مضمونة* 👾";

var keyboard = [
  [
    { text: "⁞ واتسأب 💬", callback_data: "Kn-wa" },
    { text: "⁞ تيليجرام 📢", callback_data: "Kn-tg" }
  ],
  [
    { text: "⁞ إنستقرام 🎥", callback_data: "Kn-ig" },
    { text: "⁞ فيسبوك 🏆", callback_data: "Kn-fb" }
  ],
  [
    { text: "⁞ تويتر 🚀", callback_data: "Kn-tw" },
    { text: "⁞ تيكتوك 🎬", callback_data: "Kn-lf" }
  ],
  [
    { text: "⁞ قوقل 🌐", callback_data: "Kn-go" },
    { text: "⁞ سناب 🐬", callback_data: "Kn-fu" }
  ],
  [
    { text: "👑 سيرفر موقع محمد المباشر", callback_data: "buy_mohammed" }
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
