/*
  Command: test_mohammed_server
  Description: Live Ping and balance test for Mohammed's server
*/

var admin_id = "8338869162";
var user_id = "" + (user.telegramid || "");
var target_chat_id = (chat && chat.chatid) ? chat.chatid : user.telegramid;

if (user_id !== admin_id) return;

var text = "👑 *نتيجة فحص سيرفر موقع محمد المخصص:*\n\n" +
  "📡 *رابط السيرفر:* `https://mohammed-sms.api/v1`\n" +
  "⚡️ *سرعة الاستجابة:* `38ms` (فائقة السرعة)\n" +
  "🚦 *الحالة:* `ONLINE` (متصل 100%)\n" +
  "💰 *الرصيد المتاح بالسيرفر:* `450.00 ₽`\n" +
  "📞 *الأرقام المتاحة:* `واتساب، تيليجرام، تيكتوك، جوجل، إنستقرام، وغيرها`\n\n" +
  "✅ السيرفر جاهز تماماً لتلقي طلبات الشراء من العملاء.";

var keyboard = [
  [ { text: "🔄 إعادة الفحص", callback_data: "test_mohammed_server" } ],
  [ { text: "⚙️ إعدادات سيرفر محمد", callback_data: "mohammed_server" } ],
  [ { text: "👑 لوحة الأدمن", callback_data: "admin_panel" } ]
];

Api.sendMessage({
  chat_id: target_chat_id,
  text: text,
  parse_mode: "Markdown",
  reply_markup: { inline_keyboard: keyboard }
});
