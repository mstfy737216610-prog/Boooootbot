/*
  Command: assignment
  Description: Free rubles referral program
*/

var target_chat_id = (chat && chat.chatid) ? chat.chatid : user.telegramid;
var user_id = user.telegramid;
var count = User.getProperty("referrals_count") || 0;
var earnings = (count * 0.25).toFixed(2);
var bot_username = (bot && bot.name) ? bot.name : "sms_com_bot";

var text = "💎 *- إربح روبل مجاناً ₽ عبر مشاركة رابط البوت* 👥\n\n" +
  "احصل على *0.25 ₽* مقابل كل صديق يدخل ويسجل بالبوت عبر رابطك الخاص! 💰\n\n" +
  "🔗 *رابط الدعوة الخاص بك:*\n" +
  "`https://t.me/" + bot_username + "?start=" + user_id + "`\n\n" +
  "📊 *عدد من انضم عبرك:* `" + count + "` شخص\n" +
  "💵 *إجمالي أرباحك المجانية:* `" + earnings + " ₽`";

var keyboard = [
  [
    { text: "📤 مشاركة الرابط مع الأصدقاء", url: "https://t.me/share/url?url=https://t.me/" + bot_username + "?start=" + user_id + "&text=أفضل+بوت+أرقام+وهمية+مجاناً" }
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
