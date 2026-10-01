/*
  Command: card
  Description: Generate instant recharge card codes
*/

var admin_id = "8338869162";
var user_id = "" + (user.telegramid || "");

if (user_id !== admin_id) return;

var amt = parseFloat(params) || 50;
var random_code = "CARD-" + amt + "RUB-" + Math.random().toString(36).substring(2, 8).toUpperCase() + "-" + Math.floor(1000 + Math.random() * 9000);

var text = "🎫 *تم توليد كرت شحن جديد بنجاح!* ✅\n\n" +
  "💳 *كود الكرت:* `" + random_code + "`\n" +
  "💰 *القيمة:* *" + amt + " ₽*\n\n" +
  "إضغط على كود الكرت لنسخه ومشاركته مع العميل مباشرة للشحن عبر زر (أشحن رصيدك).";

var keyboard = [
  [ { text: "توليد كرت آخر 💳", callback_data: "card " + amt } ],
  [ { text: "🔙 رجوع للوحة الأدمن", callback_data: "admin_panel" } ]
];

Api.sendMessage({
  chat_id: user_id,
  text: text,
  parse_mode: "Markdown",
  reply_markup: { inline_keyboard: keyboard }
});
