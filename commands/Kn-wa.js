/*
  Command: Kn-wa
  Description: WhatsApp numbers country list
*/

var target_chat_id = (chat && chat.chatid) ? chat.chatid : user.telegramid;

var text = "💬 *اختر دولة لشراء رقم واتساب (WhatsApp):*\n\n" +
  "اختر الدولة وسيقوم البوت بطلب الرقم لك فورياً عبر السيرفر الفعلي المباشر ↘️";

var keyboard = [
  [
    { text: "كولومبيا 🇨🇴 ¦ 15 ₽ (الأرخص)", callback_data: "Xi wa colombia 15" },
    { text: "ألبانيا 🇦🇱 ¦ 15 ₽ (ممتاز)", callback_data: "Xi wa albania 15" }
  ],
  [
    { text: "أنغولا 🇦🇴 ¦ 18 ₽", callback_data: "Xi wa angola 18" },
    { text: "مصر 🇪🇬 ¦ 20 ₽", callback_data: "Xi wa egypt 20" }
  ],
  [
    { text: "الأرجنتين 🇦🇷 ¦ 16 ₽", callback_data: "Xi wa argentina 16" },
    { text: "أوكرانيا 🇺🇦 ¦ 16 ₽", callback_data: "Xi wa ukraine 16" }
  ],
  [
    { text: "إندونيسيا 🇮🇩 ¦ 10 ₽", callback_data: "Xi wa indonesia 10" },
    { text: "روسيا 🇷🇺 ¦ 45 ₽", callback_data: "Xi wa russia 45" }
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
