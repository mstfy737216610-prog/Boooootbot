/*
  Command: offers_tg
  Description: Telegram number offers
*/

var target_chat_id = (chat && chat.chatid) ? chat.chatid : user.telegramid;

var text = "🎁 *عروض أرقام Telegram السريعة الحقيقية:*\n\n" +
  "اختر الدولة للشراء الفوري بأقل تكلفة وجودة تفعيل مضمونة ↘️";

var keyboard = [
  [
    { text: "كولومبيا 🇨🇴 ¦ 10 ₽ (الأرخص)", callback_data: "Xi tg colombia 10" },
    { text: "مصر 🇪🇬 ¦ 15 ₽", callback_data: "Xi tg egypt 15" }
  ],
  [
    { text: "أنغولا 🇦🇴 ¦ 12 ₽", callback_data: "Xi tg angola 12" },
    { text: "ألبانيا 🇦🇱 ¦ 18 ₽", callback_data: "Xi tg albania 18" }
  ],
  [
    { text: "الأرجنتين 🇦🇷 ¦ 22 ₽", callback_data: "Xi tg argentina 22" },
    { text: "روسيا 🇷🇺 ¦ 15 ₽", callback_data: "Xi tg russia 15" }
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
