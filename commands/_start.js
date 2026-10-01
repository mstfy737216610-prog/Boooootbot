/*
  Command: /start
  Platform: Bots.Business BJS & Telegram Bot API
*/

var admin_id = "8338869162";
var user_id = "" + (user.telegramid || "");
var target_chat_id = (chat && chat.chatid) ? chat.chatid : user.telegramid;
var admin_ids = ["8338869162", "7607633343", "5987430521"];
var is_admin = (admin_ids.indexOf(user_id) !== -1);
var first_name = user.first_name || "مكتب الإبداع";

// Get user balance (synced between global Bot and User properties)
var balance = Bot.getProperty("balance_" + user_id) || User.getProperty("balance");
if (balance === undefined || balance === null) {
  balance = is_admin ? "50.0" : "0.0";
  Bot.setProperty("balance_" + user_id, balance, "string");
  User.setProperty("balance", balance, "string");
} else {
  // Keep in sync
  User.setProperty("balance", "" + balance, "string");
}

var main_text = "• *القائمة الرئيسية* 🏡\n" +
  "💙 *" + first_name + "* 💙\n\n" +
  "🆔 : `" + user_id + "` •\n" +
  "💷 : *" + balance + " ₽* •\n\n" +
  "💙 [قـنـاة الـبـوت](https://t.me/sms_com_bot) 💙\n" +
  "💗 [قـنـاة الـتـفـعـيـلات](https://t.me/pilotoooo) 💗\n" +
  "🇸🇦🇮🇩🇻🇳🇾🇪 *من الدول المتوفرة حالياً* ــ\n" +
  "💡 *شرح استخدام البوت* ــ\n\n" +
  "╰•|_____(PLUS SMS)_____|•╯";

var keyboard = [
  [
    { text: "☎️ شراء رقم افتراضي", callback_data: "Buynum" }
  ],
  [
    { text: "عروض Telegram", callback_data: "offers_tg" },
    { text: "عروض WhatsApp", callback_data: "offers_wa" }
  ],
  [
    { text: "السيرفرت الاكثر شراؤها", callback_data: "saavmotamy" }
  ],
  [
    { text: "•🎲 الأكثر توفراً •", callback_data: "worldwide" },
    { text: "•🎳 أشحن رصيدك•", callback_data: "Payment" }
  ],
  [
    { text: "•🔭 الرشـ%ـق وشحن الألعاب والبرامج •", callback_data: "sh" }
  ],
  [
    { text: "•💎 اربح روبل مجاناً ₽ •", callback_data: "assignment" }
  ],
  [
    { text: "• تحويل الرصيد 🔄 •", callback_data: "SendCoin" },
    { text: "الدعم ⏰", callback_data: "super" }
  ],
  [
    { text: "• تعليمات للاستخدام ✔️ •", callback_data: "to_explain" }
  ],
  [
    { text: "حسابي", callback_data: "MyAccount" }
  ]
];

// If admin, add the direct admin control button at top
if (is_admin) {
  keyboard.unshift([
    { text: "👑 لوحة تحكم الأدمن والمالك ⚙️", callback_data: "admin_panel" }
  ]);
}

try {
  Api.sendMessage({
    chat_id: target_chat_id,
    text: main_text,
    parse_mode: "Markdown",
    disable_web_page_preview: true,
    reply_markup: {
      inline_keyboard: keyboard
    }
  });
} catch(err) {
  Bot.sendInlineKeyboard(keyboard, main_text);
}
