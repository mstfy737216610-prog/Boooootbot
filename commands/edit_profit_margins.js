/*
  Command: edit_profit_margins
  Description: Quickly change profit margins for sites
*/

var admin_id = "8338869162";
var user_id = "" + (user.telegramid || "");
var target_chat_id = (chat && chat.chatid) ? chat.chatid : user.telegramid;

if (user_id !== admin_id) return;

var text = "💰 *تعديل نسبة الربح المضافة للمواقع بالروبل:*\n\n" +
  "اختر الإجراء لضبط الربح المضاف فوق سعر الرقم الأصلي:\n\n" +
  "• سيرفر موقع محمد: `+2.0 ₽`\n" +
  "• موقع 5sim.biz: `+1.5 ₽`\n" +
  "• موقع sms-man.ru: `+1.5 ₽`\n" +
  "• باقي المواقع: `+1.0 ₽`";

var keyboard = [
  [
    { text: "زيادة +0.5 ₽ لسيرفر محمد", callback_data: "inc_mohammed_profit" },
    { text: "خصم -0.5 ₽ لسيرفر محمد", callback_data: "dec_mohammed_profit" }
  ],
  [
    { text: "زيادة +1.0 ₽ لجميع المواقع", callback_data: "inc_all_profit" },
    { text: "خصم -0.5 ₽ لجميع المواقع", callback_data: "dec_all_profit" }
  ],
  [
    { text: "🔙 رجوع لقسم السيرفرات", callback_data: "servers_menu" }
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
