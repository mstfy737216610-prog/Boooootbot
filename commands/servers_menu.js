/*
  Command: servers_menu
  Description: Manage SMS Provider Servers directly from inside the Bot
*/

var admin_id = "8338869162";
var user_id = "" + (user.telegramid || "");
var target_chat_id = (chat && chat.chatid) ? chat.chatid : user.telegramid;

if (user_id !== admin_id) return;

var text = "🌐 *إدارة السيرفرات ومواقع التوريد الحقيقية:*\n\n" +
  "تستطيع من هنا:\n" +
  "1️⃣ إضافة موقع جديد عبر إرسال الرابط (URL) ومفتاح الـ API.\n" +
  "2️⃣ تغيير السيرفر الافتراضي لشراء الأرقام.\n" +
  "3️⃣ تعديل نسبة الربح المضافة لكل موقع.\n" +
  "4️⃣ فحص الرصيد الحقيقي المتبقي في حسابك بكل موقع.\n\n" +
  "المواقع المتصلة حالياً:\n" +
  "• سيرفر موقع محمد: `ONLINE` (مفعل)\n" +
  "• 5sim.biz: `ONLINE` (مفعل)\n" +
  "• sms-man.ru: `ONLINE` (مفعل)\n" +
  "• vak-sms.com: `ONLINE` (مفعل)";

var keyboard = [
  [
    { text: "➕ إضافة موقع جديد بالرابط و API", callback_data: "add_custom_site" }
  ],
  [
    { text: "👑 ضبط سيرفر موقع محمد", callback_data: "mohammed_server" },
    { text: "💸 كشف أرصدة المواقع الحقيقية", callback_data: "check_all_balances" }
  ],
  [
    { text: "⚙️ تعديل نسبة ربح المواقع", callback_data: "edit_profit_margins" }
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
