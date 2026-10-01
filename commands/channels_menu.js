/*
  Command: channels_menu
  Description: Channels & Descriptions management from inside the bot
*/

var admin_id = "8338869162";
var user_id = "" + (user.telegramid || "");
var target_chat_id = (chat && chat.chatid) ? chat.chatid : user.telegramid;

if (user_id !== admin_id) return;

var ch1 = Bot.getProperty("forced_channel_1") || "@sms_com_bot";
var ch2 = Bot.getProperty("forced_channel_2") || "@pilotoooo";
var desc = Bot.getProperty("channels_description") || "يرجى الاشتراك في قنوات التحديثات والتفعيلات الرسمية لاستخدام البوت.";

var text = "📢 *إدارة قنوات الاشتراك الإجباري والوصف:*\n\n" +
  "القنوات المفروضة حالياً بالبوت:\n" +
  "1️⃣ القناة الأولى: `" + ch1 + "`\n" +
  "2️⃣ القناة الثانية: `" + ch2 + "`\n\n" +
  "📝 *الوصف الحالي المعروض للعملاء:*\n" +
  "_" + desc + "_\n\n" +
  "إختر الإجراء المطلوب:";

var keyboard = [
  [
    { text: "➕ إضافة / تغيير قناة", callback_data: "edit_channels" },
    { text: "📝 تعديل وصف القنوات", callback_data: "edit_channel_desc" }
  ],
  [
    { text: "🗑 حذف كافة القنوات السابقة", callback_data: "delallchannels" }
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
