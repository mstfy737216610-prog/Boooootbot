/*
  Command: addcoin
  Description: Add balance to a user account
*/

var admin_ids = ["8338869162", "7607633343", "5987430521"];
var user_id = "" + (user.telegramid || "");
var target_chat_id = (chat && chat.chatid) ? chat.chatid : user.telegramid;

var is_admin = false;
for (var i = 0; i < admin_ids.length; i++) {
  if (user_id === admin_ids[i]) {
    is_admin = true;
    break;
  }
}

if (!is_admin) {
  Bot.sendMessage("⚠️ هذا الأمر مخصص لإدارة ومالك البوت فقط.\nمعرف حسابك: `" + user_id + "`", { parse_mode: "Markdown" });
  return;
}

// 1. Get raw input from params or message
var raw = "" + (params || "");
if (!raw && typeof message !== "undefined" && message) {
  raw = "" + message;
}

// 2. Extract all numbers (handles multiple spaces, no spaces, tabs, etc.)
var numbers = raw.match(/\d+(\.\d+)?/g);

if (!numbers || numbers.length === 0) {
  var prompt_msg = "♻️ *إضافة رصيد روبل لحساب عميل:*\n\n" +
    "أرسل الأمر مع أيدي العضو والمبلغ بأي صيغة تريدها:\n" +
    "`/addcoin <Telegram_ID> <المبلغ>`\n\n" +
    "📌 *أمثلة صحيحة ومقبولة:*\n" +
    "`/addcoin 8338869162 100`\n" +
    "`/addcoin 7607633343 50`\n" +
    "`addcoin 8338869162 100`\n" +
    "`شحن 8338869162 100`";

  Bot.sendMessage(prompt_msg, { parse_mode: "Markdown" });
  return;
}

var target_user = "";
var amount = 0;

if (numbers.length === 1) {
  // Only amount was provided, charge to admin's own ID
  target_user = user_id;
  amount = parseFloat(numbers[0]) || 0;
} else {
  // If first number is long (ID) and second is amount
  var n1 = numbers[0];
  var n2 = numbers[1];

  if (n1.length >= 7 && n2.length < 7) {
    target_user = n1;
    amount = parseFloat(n2) || 0;
  } else if (n2.length >= 7 && n1.length < 7) {
    target_user = n2;
    amount = parseFloat(n1) || 0;
  } else {
    target_user = n1;
    amount = parseFloat(n2) || 0;
  }
}

if (amount <= 0 || !target_user) {
  Bot.sendMessage("❌ يرجى كتابة الأيدي والمبلغ بشكل صحيح.\nمثال: `/addcoin 8338869162 100`", { parse_mode: "Markdown" });
  return;
}

// 3. Update balance in Bot properties
var cur_bal_str = Bot.getProperty("balance_" + target_user);
if (cur_bal_str === undefined || cur_bal_str === null) {
  cur_bal_str = (target_user === "8338869162" || target_user === "7607633343") ? "10.5" : "0.0";
}
var cur_bal = parseFloat(cur_bal_str) || 0.0;
var new_bal = +(cur_bal + amount).toFixed(2);

// Save in global Bot storage for that user
Bot.setProperty("balance_" + target_user, "" + new_bal, "string");

// If target is current user, update User property as well
if (target_user === user_id) {
  User.setProperty("balance", "" + new_bal, "string");
}

// Also support Libs.ResourcesLib if loaded
try {
  if (typeof Libs !== "undefined" && Libs.ResourcesLib) {
    Libs.ResourcesLib.anotherUserRes("balance", target_user).add(amount);
  }
} catch(e) {}

// 4. Send Confirmation to Admin
var success_msg = "✅ *تم شحن الرصيد بنجاح!* 💰\n\n" +
  "👤 *أيدي الحساب:* `" + target_user + "`\n" +
  "➕ *المبلغ المضاف:* `+" + amount + " ₽`\n" +
  "💷 *الرصيد الكلي الآن:* `*" + new_bal + " ₽*`";

Bot.sendMessage(success_msg, { parse_mode: "Markdown" });

// 5. Notify the recipient user directly
if (target_user !== user_id) {
  try {
    Api.sendMessage({
      chat_id: target_user,
      text: "🎉 *تهانينا! تم شحن رصيد حسابك في البوت بمبلغ:* `+" + amount + " ₽` بنجاح.\n💷 رصيدك الحالي: *" + new_bal + " ₽*",
      parse_mode: "Markdown"
    });
  } catch(e) {}
}
