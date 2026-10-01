/*
  Command: edit_channels
  Description: Add or change mandatory channels
*/

var admin_id = "8338869162";
var user_id = "" + (user.telegramid || "");
var target_chat_id = (chat && chat.chatid) ? chat.chatid : user.telegramid;

if (user_id !== admin_id) return;

if (!params) {
  var msg = "➕ *إضافة أو تعيين قناة اشتراك إجباري:*\n\n" +
    "أرسل الأمر مع معرف القناة ورقمها هكذا:\n" +
    "`/edit_channels 1 @MyNewChannel`\n\n" +
    "أو:\n" +
    "`/edit_channels 2 @MyActivationChannel`\n\n" +
    "💡 *تلميح:* لحذف كافة القنوات اضغط زر (حذف كافة القنوات السابقة).";

  Api.sendMessage({
    chat_id: target_chat_id,
    text: msg,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [ { text: "🗑 حذف كافة القنوات السابقة", callback_data: "delallchannels" } ],
        [ { text: "🔙 رجوع لقسم القنوات", callback_data: "channels_menu" } ]
      ]
    }
  });
  return;
}

var parts = params.split(" ");
var channel_slot = parts[0];
var channel_name = parts[1];

if (channel_slot === "1") {
  Bot.setProperty("forced_channel_1", channel_name, "string");
} else {
  Bot.setProperty("forced_channel_2", channel_name, "string");
}
Bot.setProperty("has_forced_channels", true, "boolean");

Api.sendMessage({
  chat_id: target_chat_id,
  text: "✅ تم حفظ وتعيين القناة `" + channel_name + "` كقناة اشتراك إجباري بنجاح!",
  parse_mode: "Markdown",
  reply_markup: {
    inline_keyboard: [
      [ { text: "📢 قسم القنوات", callback_data: "channels_menu" } ],
      [ { text: "👑 لوحة الأدمن", callback_data: "admin_panel" } ]
    ]
  }
});
