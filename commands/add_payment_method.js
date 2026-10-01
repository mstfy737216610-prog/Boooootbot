/*
  Command: add_payment_method
  Description: Add a new payment method/account
*/

var admin_id = "8338869162";
var user_id = "" + (user.telegramid || "");
var target_chat_id = (chat && chat.chatid) ? chat.chatid : user.telegramid;

if (user_id !== admin_id) return;

if (!params) {
  var msg = "➕ *إضافة طريقة شحن جديدة للبوت:*\n\n" +
    "أرسل البيانات بالصيغة التالية:\n" +
    "`/add_payment_method <اسم_البنك> <رقم_الحساب> <اسم_المستفيد>`\n\n" +
    "مثال:\n" +
    "`/add_payment_method بنك_التضامن 1029384756 محمد_أحمد`";

  Api.sendMessage({
    chat_id: target_chat_id,
    text: msg,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [ { text: "🔙 رجوع لطرق الدفع", callback_data: "payment_menu" } ]
      ]
    }
  });
  return;
}

var parts = params.split(" ");
var bank = parts[0] || "بنك";
var acc = parts[1] || "";
var holder = parts[2] || "";

Bot.setProperty("custom_payment_" + bank, acc + " | " + holder, "string");

Api.sendMessage({
  chat_id: target_chat_id,
  text: "✅ تم إضافة طريقة الشحن الجديدة `" + bank + "` بنجاح!\nالحساب: `" + acc + "`",
  parse_mode: "Markdown",
  reply_markup: {
    inline_keyboard: [
      [ { text: "💳 قائمة طرق الدفع", callback_data: "payment_menu" } ],
      [ { text: "👑 لوحة الأدمن", callback_data: "admin_panel" } ]
    ]
  }
});
