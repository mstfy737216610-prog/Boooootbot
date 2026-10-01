/*CMD
  command: mustafa_5sim
  help: سيرفر مصطفى 5SIM.NET الحصري
  need_reply: false
  auto_retry_buy: true
CMD*/

// سيرفر مصطفى (5SIM.NET) - شراء تلقائي بأرخص مشغل وسعر
let adminId = "8338869162";
let userId = "" + user.telegramid;
let isOwner = (userId === adminId || userId === "5987430521");

if (!isOwner) {
  Bot.sendMessage("⚠️ هذا الأمر مخصص لمالك البوت فقط.");
  return;
}

let profile = Bot.getProperty("MUSTAFA_5SIM_PROFILE", {
  id: 4437001,
  email: "mstfy737216610@gmail.com",
  balanceUsd: 3.4971,
  rating: 96
});

let text = "👑 *إعدادات سيرفر مصطفى (5SIM.NET الحصري)*\n\n" +
  "المزود المعتمد الوحيد حالياً بالبوت:\n\n" +
  "👤 *صاحب الحساب:* مصطفى\n" +
  "🆔 *معرف الحساب في 5sim:* `#4437001`\n" +
  "📧 *البريد:* `mstfy737216610@gmail.com`\n" +
  "💵 *الرصيد الفعلي في 5sim:* `$" + profile.balanceUsd + " USD`\n" +
  "⭐ *تقييم الحساب:* `96` (ممتاز)\n" +
  "🎯 *آلية الشراء:* البحث التلقائي عن أرخص مشغل (مثل `virtual34` بسعر يبدأ من $0.10)\n" +
  "💷 *عملة البيع للعملاء:* بالروبل الروسي (₽) حسب جدول التسعير المخصص لك";

let buttons = [
  [ { text: "🔄 فحص الرصيد الحقيقي من 5sim", callback_data: "check_all_balances" } ],
  [ { text: "🏷️ تعديل جدول أسعار الروبل", callback_data: "custom_prices_menu" } ],
  [ { text: "🔙 رجوع لقسم السيرفرات", callback_data: "servers_menu" } ]
];

Bot.sendInlineKeyboard(buttons, text);
