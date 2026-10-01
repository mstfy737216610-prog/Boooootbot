/*
  Command: payment_menu
  Description: Manage payment methods and banking accounts from inside the bot
*/

var admin_id = "8338869162";
var user_id = "" + (user.telegramid || "");
var target_chat_id = (chat && chat.chatid) ? chat.chatid : user.telegramid;

if (user_id !== admin_id) return;

var text = "💳 *إدارة طرق الشحن والحسابات البنكية:*\n\n" +
  "طرق الدفع المفعلة حالياً بالبوت:\n" +
  "• بنك الكريمي (حساب / جوال): `3049582109`\n" +
  "• النجم للصرافة والتحويلات: `محمد علي سالم`\n" +
  "• بينانس وبايير USDT: `Pay ID: 394850211`\n" +
  "• STC Pay والراجحي (السعودية): `+966500000000`\n" +
  "• آسياسيل وزين كاش (العراق): `07700000000`\n\n" +
  "إختر الإجراء المطلوب:";

var keyboard = [
  [
    { text: "➕ إضافة طريقة شحن جديدة", callback_data: "add_payment_method" }
  ],
  [
    { text: "✏️ تعديل رقم حساب أو بنك", callback_data: "edit_payment_account" }
  ],
  [
    { text: "🎟 توليد كروت شحن روبل", callback_data: "card" }
  ],
  [
    { text: "🔙 رجوع للوحة الأدمن", callback_data: "admin_panel" }
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
