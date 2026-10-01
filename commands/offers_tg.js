/*
  Command: offers_tg
  Description: Telegram number offers
*/

var target_chat_id = (chat && chat.chatid) ? chat.chatid : user.telegramid;

var text = "🎁 *عروض أرقام Telegram السريعة الحصرية:*\n\n" +
  "اختر الدولة للشراء الفوري بأقل تكلفة وجودة تفعيل مضمونة ↘️";

var keyboard = [
  [
    { text: "روسيا 🇷🇺 ¦ 15 ₽", callback_data: "Xi-tg-russia" },
    { text: "أوكرانيا 🇺🇦 ¦ 16 ₽", callback_data: "Xi-tg-ukraine" }
  ],
  [
    { text: "كازاخستان 🇰🇿 ¦ 18 ₽", callback_data: "Xi-tg-kazakhstan" },
    { text: "إندونيسيا 🇮🇩 ¦ 12 ₽", callback_data: "Xi-tg-indonesia" }
  ],
  [
    { text: "👑 سيرفر موقع محمد لتيليجرام (سريع)", callback_data: "buy_mohammed tg" }
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
