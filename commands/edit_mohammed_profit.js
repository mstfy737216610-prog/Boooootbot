/*
  Command: edit_mohammed_profit
  Description: Quick change Mohammed's server profit
*/

var admin_id = "8338869162";
var user_id = "" + (user.telegramid || "");
var target_chat_id = (chat && chat.chatid) ? chat.chatid : user.telegramid;

if (user_id !== admin_id) return;

if (params) {
  var new_profit = parseFloat(params) || 2.0;
  Bot.setProperty("mohammed_server_profit", "" + new_profit, "string");
  Api.sendMessage({
    chat_id: target_chat_id,
    text: "✅ تم ضبط هامش ربح سيرفر موقع محمد إلى: `" + new_profit + " ₽` بنجاح.",
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [ { text: "⚙️ إعدادات سيرفر محمد", callback_data: "mohammed_server" } ]
      ]
    }
  });
  return;
}

var text = "💵 *اختر نسبة الربح المضافة لسيرفر موقع محمد:*";
var keyboard = [
  [
    { text: "1.0 ₽ ربح", callback_data: "edit_mohammed_profit 1.0" },
    { text: "1.5 ₽ ربح", callback_data: "edit_mohammed_profit 1.5" }
  ],
  [
    { text: "2.0 ₽ ربح", callback_data: "edit_mohammed_profit 2.0" },
    { text: "3.0 ₽ ربح", callback_data: "edit_mohammed_profit 3.0" }
  ],
  [
    { text: "5.0 ₽ ربح", callback_data: "edit_mohammed_profit 5.0" }
  ],
  [
    { text: "🔙 رجوع", callback_data: "mohammed_server" }
  ]
];

Api.sendMessage({
  chat_id: target_chat_id,
  text: text,
  parse_mode: "Markdown",
  reply_markup: { inline_keyboard: keyboard }
});
