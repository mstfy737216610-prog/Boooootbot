/*
  Command: opclo
  Description: Section locking and unlocking
*/

var admin_id = "8338869162";
var user_id = "" + (user.telegramid || "");
var target_chat_id = (chat && chat.chatid) ? chat.chatid : user.telegramid;

if (user_id !== admin_id) return;

var bot_locked = Bot.getProperty("bot_locked") === true;
var offers_locked = Bot.getProperty("offers_locked") === true;
var wa_locked = Bot.getProperty("wa_locked") === true;
var tg_locked = Bot.getProperty("tg_locked") === true;

if (params === "toggle_bot") {
  Bot.setProperty("bot_locked", !bot_locked, "boolean");
  bot_locked = !bot_locked;
} else if (params === "toggle_offers") {
  Bot.setProperty("offers_locked", !offers_locked, "boolean");
  offers_locked = !offers_locked;
} else if (params === "toggle_wa") {
  Bot.setProperty("wa_locked", !wa_locked, "boolean");
  wa_locked = !wa_locked;
} else if (params === "toggle_tg") {
  Bot.setProperty("tg_locked", !tg_locked, "boolean");
  tg_locked = !tg_locked;
}

var text = "🔏 *لوحة قفل وفتح أقسام وسيرفرات البوت:*\n\n" +
  "• حالة البوت: " + (bot_locked ? "مغلق للصيانة ❌" : "يعمل بشكل طبيعي ✅") + "\n" +
  "• قسم العروض: " + (offers_locked ? "مقفل ❌" : "مفتوح متاح ✅") + "\n" +
  "• سيرفر واتساب: " + (wa_locked ? "مقفل ❌" : "مفتوح متاح ✅") + "\n" +
  "• سيرفر تيليجرام: " + (tg_locked ? "مقفل ❌" : "مفتوح متاح ✅") + "\n\n" +
  "اضغط على أي زر لتبديل حالته فورياً:";

var keyboard = [
  [
    { text: bot_locked ? "فتح البوت ✅" : "قفل البوت ❌", callback_data: "opclo toggle_bot" }
  ],
  [
    { text: offers_locked ? "فتح قسم العروض ✅" : "قفل قسم العروض ❌", callback_data: "opclo toggle_offers" }
  ],
  [
    { text: wa_locked ? "فتح سيرفر واتساب ✅" : "قفل سيرفر واتساب ❌", callback_data: "opclo toggle_wa" },
    { text: tg_locked ? "فتح سيرفر تيليجرام ✅" : "قفل سيرفر تيليجرام ❌", callback_data: "opclo toggle_tg" }
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
