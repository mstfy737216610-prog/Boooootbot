/*
  Command: edit_payment_account
  Description: Edit payment account details
*/

var admin_id = "8338869162";
var user_id = "" + (user.telegramid || "");
var target_chat_id = (chat && chat.chatid) ? chat.chatid : user.telegramid;

if (user_id !== admin_id) return;

var msg = "✏️ *تعديل بيانات الحسابات وطرق الشحن:*\n\n" +
  "لتعديل حساب بنك الكريمي أرسل:\n" +
  "`/add_payment_method الكريمي <الرقم_الجديد> <اسم_المستفيد>`\n\n" +
  "لتعديل بايننس USDT أرسل:\n" +
  "`/add_payment_method USDT <عنوان_المحفظة_أو_Pay_ID>`";

Api.sendMessage({
  chat_id: target_chat_id,
  text: msg,
  parse_mode: "Markdown",
  reply_markup: {
    inline_keyboard: [
      [ { text: "💳 رجوع لقسم الدفع", callback_data: "payment_menu" } ],
      [ { text: "👑 لوحة الأدمن", callback_data: "admin_panel" } ]
    ]
  }
});
