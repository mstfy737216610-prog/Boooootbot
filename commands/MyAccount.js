/*
  Command: MyAccount
  Description: User account information and tools
*/

var target_chat_id = (chat && chat.chatid) ? chat.chatid : user.telegramid;
var user_id = "" + (user.telegramid || "");
var balance = Bot.getProperty("balance_" + user_id) || User.getProperty("balance") || "0.0";
var referrals = User.getProperty("referrals_count") || "0";

var text = "👤 *تفاصيل حسابك الشخصي:*\n\n" +
  "🆔 أيدي الحساب: `" + user_id + "`\n" +
  "💷 الرصيد المتاح: *" + balance + " ₽*\n" +
  "👥 عدد الإحالات: *" + referrals + "* شخص\n" +
  "🛡 حالة الحساب: `موثق ونشط ✅`\n\n" +
  "اختر الإجراء المطلوب:";

var keyboard = [
  [
    { text: "• تحويل الرصيد 🔄 •", callback_data: "SendCoin" },
    { text: "•🎳 أشحن رصيدك•", callback_data: "Payment" }
  ],
  [
    { text: "•💎 اربح روبل مجاناً ₽ •", callback_data: "assignment" }
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
