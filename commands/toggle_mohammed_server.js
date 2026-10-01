/*
  Command: toggle_mohammed_server
  Description: Toggle Mohammed's dedicated server active / inactive
*/

var admin_id = "8338869162";
var user_id = "" + (user.telegramid || "");
var target_chat_id = (chat && chat.chatid) ? chat.chatid : user.telegramid;

if (user_id !== admin_id) return;

var current_status = Bot.getProperty("mohammed_server_active") !== false;
var new_status = !current_status;
Bot.setProperty("mohammed_server_active", new_status, "boolean");

var status_text = new_status ? "✅ تم تفعيل سيرفر موقع محمد كسيرفر رئيسي للأرقام!" : "❌ تم إيقاف سيرفر موقع محمد مؤقتاً.";

Api.sendMessage({
  chat_id: target_chat_id,
  text: status_text + "\n\nيمكنك الرجوع لإعدادات السيرفر أو لوحة الأدمن.",
  reply_markup: {
    inline_keyboard: [
      [ { text: "⚙️ إعدادات سيرفر محمد", callback_data: "mohammed_server" } ],
      [ { text: "👑 لوحة الأدمن", callback_data: "admin_panel" } ]
    ]
  }
});
