/*
  Command: to_explain
  Description: User instructions and rules
*/

var target_chat_id = (chat && chat.chatid) ? chat.chatid : user.telegramid;

var text = "• *تعليمات للاستخدام ✔️*\n\n" +
  "1️⃣ *طريقة شراء وتفعيل رقم:*\n" +
  "اضغط على (☎️ شراء رقم افتراضي)، اختر التطبيق ثم الدولة، سيظهر لك الرقم فوراً.\n\n" +
  "2️⃣ *طلب الكود:*\n" +
  "ضع الرقم في واتساب أو تيليجرام واطلب الكود عبر SMS، ثم اضغط زر (تحديث الكود ♻️).\n\n" +
  "3️⃣ *ضمان الرصيد:*\n" +
  "إذا لم يصل الكود خلال مدة الصلاحية، يمكنك إلغاء الرقم واسترداد رصيدك بالكامل تلقائياً 🛡.\n\n" +
  "4️⃣ *شحن الحساب:*\n" +
  "يمكنك شحن رصيدك عبر الكريمي، النجم، بايننس USDT، أو إدخال كرت شحن.";

var keyboard = [
  [
    { text: "☎️ شراء رقم الآن", callback_data: "Buynum" }
  ],
  [
    { text: "- رجوع 🔙", callback_data: "/start" }
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
