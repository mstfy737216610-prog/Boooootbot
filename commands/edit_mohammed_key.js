/*
  Command: edit_mohammed_key
  Description: Change Mohammed's server API Key
*/

var admin_id = "8338869162";
var user_id = "" + (user.telegramid || "");
var target_chat_id = (chat && chat.chatid) ? chat.chatid : user.telegramid;

if (user_id !== admin_id) return;

if (!params) {
  var msg = "🔑 *تغيير مفتاح API لسيرفر موقع محمد:*\n\n" +
    "أرسل الأمر مع المفتاح الجديد:\n" +
    "`/edit_mohammed_key <المفتاح_الجديد>`\n\n" +
    "مثال:\n" +
    "`/edit_mohammed_key SECURE_KEY_998811`";

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

Bot.setProperty("mohammed_server_key", params, "string");
Api.sendMessage({
  chat_id: target_chat_id,
  text: "✅ تم تحديث مفتاح الـ API لسيرفر موقع محمد بنجاح.",
  parse_mode: "Markdown",
  reply_markup: {
    inline_keyboard: [
      [ { text: "⚙️ إعدادات سيرفر محمد", callback_data: "mohammed_server" } ]
    ]
  }
});
