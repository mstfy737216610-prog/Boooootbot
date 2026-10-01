/*
  Command: edit_channel_desc
  Description: Update channels description text
*/

var admin_id = "8338869162";
var user_id = "" + (user.telegramid || "");
var target_chat_id = (chat && chat.chatid) ? chat.chatid : user.telegramid;

if (user_id !== admin_id) return;

if (!params) {
  var msg = "📝 *تعديل وصف ورسالة القنوات الإجبارية:*\n\n" +
    "أرسل الوصف الجديد هكذا:\n" +
    "`/edit_channel_desc <نص_الوصف_الجديد>`\n\n" +
    "مثال:\n" +
    "`/edit_channel_desc يرجى الاشتراك بقنوات البوت الرسمية للتفعيل واستلام الأرقام المجانية`";

  Api.sendMessage({
    chat_id: target_chat_id,
    text: msg,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [ { text: "🔙 رجوع لقسم القنوات", callback_data: "channels_menu" } ]
      ]
    }
  });
  return;
}

Bot.setProperty("channels_description", params, "string");

Api.sendMessage({
  chat_id: target_chat_id,
  text: "✅ تم تحديث وحفظ وصف القنوات الجديد بنجاح:\n_" + params + "_",
  parse_mode: "Markdown",
  reply_markup: {
    inline_keyboard: [
      [ { text: "📢 قسم القنوات", callback_data: "channels_menu" } ],
      [ { text: "👑 لوحة الأدمن", callback_data: "admin_panel" } ]
    ]
  }
});
