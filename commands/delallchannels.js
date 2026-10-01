/*
  Command: delallchannels
  Description: Clear all forced channels to start fresh
*/

var admin_id = "8338869162";
var user_id = "" + (user.telegramid || "");
var target_chat_id = (chat && chat.chatid) ? chat.chatid : user.telegramid;

if (user_id !== admin_id) return;

Bot.setProperty("forced_channel_1", "", "string");
Bot.setProperty("forced_channel_2", "", "string");
Bot.setProperty("forced_channel_3", "", "string");
Bot.setProperty("has_forced_channels", false, "boolean");

var text = "🗑 *تم حذف وتصفير كافة القنوات السابقة بنجاح!* ✅\n\n" +
  "البوت الآن يعمل بدون إلزام بالاشتراك في القنوات السابقة.\n" +
  "تستطيع إضافة قنوات جديدة في أي وقت من لوحة الأدمن.";

var keyboard = [
  [ { text: "➕ إضافة قناة جديدة الآن", callback_data: "edit_channels" } ],
  [ { text: "🔙 رجوع لقسم القنوات", callback_data: "channels_menu" } ],
  [ { text: "👑 لوحة الأدمن", callback_data: "admin_panel" } ]
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
