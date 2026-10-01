/*
  Command: edit_mohammed_url
  Description: Change Mohammed's server URL
*/

var admin_id = "8338869162";
var user_id = "" + (user.telegramid || "");
var target_chat_id = (chat && chat.chatid) ? chat.chatid : user.telegramid;

if (user_id !== admin_id) return;

if (!params) {
  var msg = "✏️ *تغيير رابط موقع محمد المخصص:*\n\n" +
    "أرسل الأمر مع الرابط الجديد هكذا:\n" +
    "`/edit_mohammed_url <الرابط_الجديد>`\n\n" +
    "مثال:\n" +
    "`/edit_mohammed_url https://new-mohammed-server.com/api`";

  Api.sendMessage({
    chat_id: target_chat_id,
    text: msg,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [ { text: "🔙 رجوع لسيرفر محمد", callback_data: "mohammed_server" } ]
      ]
    }
  });
  return;
}

Bot.setProperty("mohammed_server_url", params, "string");
Api.sendMessage({
  chat_id: target_chat_id,
  text: "✅ تم تحديث رابط سيرفر موقع محمد إلى:\n`" + params + "` بنجاح.",
  parse_mode: "Markdown",
  reply_markup: {
    inline_keyboard: [
      [ { text: "⚙️ إعدادات سيرفر محمد", callback_data: "mohammed_server" } ]
    ]
  }
});
