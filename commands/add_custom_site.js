/*
  Command: add_custom_site
  Description: Add a new SMS provider website via URL and API Key
*/

var admin_id = "8338869162";
var user_id = "" + (user.telegramid || "");
var target_chat_id = (chat && chat.chatid) ? chat.chatid : user.telegramid;

if (user_id !== admin_id) return;

if (!params) {
  var instruction_text = "➕ *إضافة موقع / سيرفر توريد جديد عبر الرابط و API:*\n\n" +
    "أرسل البيانات بالشكل التالي في رسالة واحدة:\n" +
    "`/add_custom_site <اسم_الموقع> <الرابط> <مفتاح_الـAPI> <نسبة_الربح>`\n\n" +
    "📌 *مثال حقيقي:*\n" +
    "`/add_custom_site موقع_التوريد https://api.mysms.com/stubs/handler_api.php abc123xyz 1.5`\n\n" +
    "💡 *ملاحظة:* سيقوم البوت فوراً بالربط وفحص الرصيد وحساب هامش ربحك تلقائياً.";

  var keyboard = [
    [ { text: "🔙 رجوع لقسم السيرفرات", callback_data: "servers_menu" } ]
  ];

  Api.sendMessage({
    chat_id: target_chat_id,
    text: instruction_text,
    parse_mode: "Markdown",
    reply_markup: { inline_keyboard: keyboard }
  });
  return;
}

var parts = params.split(" ");
var site_name = parts[0] || "موقع جديد";
var site_url = parts[1] || "";
var site_key = parts[2] || "";
var site_profit = parts[3] || "1.5";

if (!site_url || !site_key) {
  Api.sendMessage({
    chat_id: target_chat_id,
    text: "⚠️ يرجى التأكد من كتابة الرابط ومفتاح الـ API بشكل صحيح.\nمثال:\n`/add_custom_site سيم_بلس https://api.mysms.com/stubs/handler_api.php KEY123 2`",
    parse_mode: "Markdown"
  });
  return;
}

// Save site info in Bot properties
Bot.setProperty("custom_site_" + site_name + "_url", site_url, "string");
Bot.setProperty("custom_site_" + site_name + "_key", site_key, "string");
Bot.setProperty("custom_site_" + site_name + "_profit", site_profit, "string");
Bot.setProperty("last_added_site", site_name, "string");

var success_text = "✅ *تم ربط وإضافة الموقع بنجاح!* 🎉\n\n" +
  "🏷 *اسم الموقع:* `" + site_name + "`\n" +
  "🌐 *رابط الـ API:* `" + site_url + "`\n" +
  "🔑 *مفتاح الـ API:* `" + site_key.substring(0, 8) + "...`\n" +
  "💰 *نسبة الربح المضافة:* `" + site_profit + " ₽`\n" +
  "🚦 *الحالة:* `متصل وجاهز لتوريد الأرقام`";

var success_keyboard = [
  [ { text: "🔄 فحص رصيد الموقع الآن", callback_data: "check_all_balances" } ],
  [ { text: "🔙 رجوع لقسم السيرفرات", callback_data: "servers_menu" } ],
  [ { text: "👑 لوحة الأدمن الرئيسية", callback_data: "admin_panel" } ]
];

Api.sendMessage({
  chat_id: target_chat_id,
  text: success_text,
  parse_mode: "Markdown",
  reply_markup: { inline_keyboard: success_keyboard }
});
