/*
  Command: Kn-tg
  Description: Telegram numbers country list
*/

var target_chat_id = (chat && chat.chatid) ? chat.chatid : user.telegramid;

var text = "📢 *اختر دولة لشراء رقم تيليجرام (Telegram):*\n\n" +
  "اختر الدولة وسيقوم البوت بطلب الرقم لك فورياً عبر السيرفر الفعلي المباشر ↘️";

var keyboard = [
  [
    { text: "كولومبيا 🇨🇴 ¦ 10 ₽ (الأرخص $0.10)", callback_data: "Xi tg colombia 10" },
    { text: "مصر 🇪🇬 ¦ 15 ₽ (3 مليون رقم)", callback_data: "Xi tg egypt 15" }
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
    { text: "أوكرانيا 🇺🇦 ¦ 16 ₽", callback_data: "Xi tg ukraine 16" },
    { text: "إندونيسيا 🇮🇩 ¦ 12 ₽", callback_data: "Xi tg indonesia 12" }
  ],
  [
    { text: "- رجوع 🔙", callback_data: "Buynum" }
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
