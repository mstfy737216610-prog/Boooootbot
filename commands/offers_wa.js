/*
  Command: offers_wa
  Description: WhatsApp number offers
*/

var target_chat_id = (chat && chat.chatid) ? chat.chatid : user.telegramid;

var text = "🎁 *عروض أرقام WhatsApp المميزة الحقيقية:*\n\n" +
  "اختر الدولة المطلوبة للشراء الفوري لواتساب ↘️";

var keyboard = [
  [
    { text: "كولومبيا 🇨🇴 ¦ 15 ₽", callback_data: "Xi wa colombia 15" },
    { text: "ألبانيا 🇦🇱 ¦ 15 ₽", callback_data: "Xi wa albania 15" }
  ],
  [
    { text: "مصر 🇪🇬 ¦ 20 ₽", callback_data: "Xi wa egypt 20" },
    { text: "أنغولا 🇦🇴 ¦ 18 ₽", callback_data: "Xi wa angola 18" }
  ],
  [
    { text: "الأرجنتين 🇦🇷 ¦ 16 ₽", callback_data: "Xi wa argentina 16" },
    { text: "أوكرانيا 🇺🇦 ¦ 16 ₽", callback_data: "Xi wa ukraine 16" }
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
