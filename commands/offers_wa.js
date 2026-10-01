/*
  Command: offers_wa
  Description: WhatsApp number offers
*/

var target_chat_id = (chat && chat.chatid) ? chat.chatid : user.telegramid;

var text = "🎁 *عروض أرقام WhatsApp المميزة:*\n\n" +
  "اختر الدولة المطلوبة للشراء الفوري لواتساب ↘️";

var keyboard = [
  [
    { text: "اليمن 🇾🇪 ¦ 20 ₽", callback_data: "Xi-wa-yemen" },
    { text: "السعودية 🇸🇦 ¦ 35 ₽", callback_data: "Xi-wa-saudi" }
  ],
  [
    { text: "مصر 🇪🇬 ¦ 15 ₽", callback_data: "Xi-wa-egypt" },
    { text: "العراق 🇮🇶 ¦ 25 ₽", callback_data: "Xi-wa-iraq" }
  ],
  [
    { text: "إندونيسيا 🇮🇩 ¦ 10 ₽", callback_data: "Xi-wa-indonesia" },
    { text: "فيتنام 🇻🇳 ¦ 11 ₽", callback_data: "Xi-wa-vietnam" }
  ],
  [
    { text: "👑 سيرفر موقع محمد لواتساب (مضمون)", callback_data: "buy_mohammed wa" }
  ],
  [
    { text: "🔙 رجوع للقائمة الرئيسية", callback_data: "/start" }
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
