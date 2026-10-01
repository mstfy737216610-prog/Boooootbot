/*
  Command: admin_panel
  Platform: Bots.Business BJS & Telegram Bot API
*/

var admin_ids = ["8338869162", "7607633343", "5987430521"];
var user_id = "" + (user.telegramid || "");
var target_chat_id = (chat && chat.chatid) ? chat.chatid : user.telegramid;
var first_name = user.first_name || "المهندس المسؤول";

var is_admin = false;
for (var i = 0; i < admin_ids.length; i++) {
  if (user_id === admin_ids[i]) {
    is_admin = true;
    break;
  }
}

if (!is_admin) {
  Bot.sendMessage("⛔️ عذراً، هذه اللوحة مخصصة فقط لمالك البوت الرسمي.\nمعرف حسابك: `" + user_id + "`", { parse_mode: "Markdown" });
  return;
}

var text = "👑 *لوحة تحكم الأدمن والمالك الشاملة*\n" +
  "أهلاً بك مطوري *" + first_name + "* 🖤\n\n" +
  "من هنا يمكنك التحكم الكامل بالبوت:\n" +
  "• إضافة وتغيير مواقع التوريد عبر الرابط و API\n" +
  "• تفعيل وتخصيص سيرفر موقع محمد\n" +
  "• تعديل قنوات الاشتراك الإجباري أو حذف القنوات السابقة\n" +
  "• التحكم بطرق الشحن وشحن/خصم رصيد العملاء\n" +
  "• توليد كروت الشحن وقفل/فتح السيرفرات\n\n" +
  "إختر الإجراء المطلوب من الأزرار بالأسفل ⬇️";

var keyboard = [
  [
    { text: "🌐 السيرفرات ومواقع الـ API", callback_data: "servers_menu" },
    { text: "👑 سيرفر موقع محمد المخصص", callback_data: "mohammed_server" }
  ],
  [
    { text: "📢 قنوات الاشتراك الإجباري والوصف", callback_data: "channels_menu" },
    { text: "🗑 حذف كافة القنوات السابقة", callback_data: "delallchannels" }
  ],
  [
    { text: "💳 طرق الشحن وحسابات البنوك", callback_data: "payment_menu" },
    { text: "🎟 صنع كروت شحن روبل", callback_data: "card" }
  ],
  [
    { text: "➕ إضافة رصيد لعضو ♻️", callback_data: "addcoin" },
    { text: "➖ خصم رصيد من عضو 📛", callback_data: "delcoin" }
  ],
  [
    { text: "🔏 قفل وفتح الأقسام", callback_data: "opclo" },
    { text: "📊 إحصائيات البوت والروبل", callback_data: "baluser" }
  ],
  [
    { text: "🏡 العودة للقائمة الرئيسية", callback_data: "/start" }
  ]
];

try {
  Api.sendMessage({
    chat_id: target_chat_id,
    text: text,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: keyboard
    }
  });
} catch(e) {
  Bot.sendInlineKeyboard(keyboard, text);
}
