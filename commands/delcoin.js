/*
  Command: delcoin
  Description: Deduct balance from a user account
*/

var admin_ids = ["8338869162", "7607633343", "5987430521"];
var user_id = "" + (user.telegramid || "");

var is_admin = false;
for (var i = 0; i < admin_ids.length; i++) {
  if (user_id === admin_ids[i]) {
    is_admin = true;
    break;
  }
}

if (!is_admin) {
  Bot.sendMessage("⚠️ هذا الأمر مخصص لإدارة ومالك البوت فقط.");
  return;
}

// 1. Get raw input from params or message
var raw = "" + (params || "");
if (!raw && typeof message !== "undefined" && message) {
  raw = "" + message;
}

// 2. Extract numbers
var numbers = raw.match(/\d+(\.\d+)?/g);

if (!numbers || numbers.length === 0) {
  var prompt_msg = "📛 *خصم رصيد روبل من حساب عميل:*\n\n" +
    "أرسل الأمر مع أيدي العضو والمبلغ بالشكل التالي:\n" +
    "`/delcoin <Telegram_ID> <المبلغ>`\n\n" +
    "مثال:\n`/delcoin 8338869162 20`\n`/delcoin 7607633343 50`";

  Bot.sendMessage(prompt_msg, { parse_mode: "Markdown" });
  return;
}

var target_user = "";
var amount = 0;

if (numbers.length === 1) {
  target_user = user_id;
  amount = parseFloat(numbers[0]) || 0;
} else {
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
  Bot.sendMessage("❌ يرجى التأكد من كتابة الأيدي والمبلغ بشكل صحيح.");
  return;
}

// 3. Deduct balance
var cur_bal_str = Bot.getProperty("balance_" + target_user);
var cur_bal = parseFloat(cur_bal_str) || 0.0;
var new_bal = +(Math.max(0, cur_bal - amount)).toFixed(2);

Bot.setProperty("balance_" + target_user, "" + new_bal, "string");

if (target_user === user_id) {
  User.setProperty("balance", "" + new_bal, "string");
}

try {
  if (typeof Libs !== "undefined" && Libs.ResourcesLib) {
    Libs.ResourcesLib.anotherUserRes("balance", target_user).remove(amount);
  }
} catch(e) {}

Bot.sendMessage("📛 *تم خصم " + amount + " ₽ بنجاح* من حساب العضو `" + target_user + "`.\n💷 الرصيد المتبقي: *" + new_bal + " ₽*", {
  parse_mode: "Markdown"
});
