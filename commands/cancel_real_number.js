/*
  Command: cancel_real_number
  Description: Cancel number on 5SIM and refund balance to user wallet
*/

var MUSTAFA_5SIM_TOKEN = "eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE4MTkxMzcxMTQsImlhdCI6MTc4NzYwMTExNCwicmF5IjoiNTZlYmFlNjg0NGQyMTAzZjAyZjUyMzJlYjVhODViNTEiLCJzdWIiOjQ0MzcwMDF9.qEpXfNoatnjn3MLJhQErUVmgfIJ-cP_laTBFdz8RkeMietQrjYqZnRHTd23NjPxVPwn0HpoAz4lAmOwTiuPjaUQkU2u9QCnh2i89MAedpfm2kosspiug1Ux6o7pJ-2fVqPGW27cQtGmOz-vZne997NCbdCc7eDxoX3ZknvorIu1ZmaCEnVlk2-t-YdHAi90GzVqjrvE0dZqZM4Mp-IgX8z71Bv1neikePV2RsE68hGMM8Z2bONHMeAqxhtezVcW0ykW1pCk_NLjcSnTWFXo_L_dgVvZLQnPB1n-ROqFan55gB-uEkuU0KN0gkvnozT9_N4wTWjAYiLTy1S3-vaooDA";

var order_id = ("" + (params || "")).trim() || User.getProperty("current_active_order_id") || "";
var uid = "" + (user.telegramid || "");
var price_str = User.getProperty("current_order_price") || "15";
var refund_price = parseFloat(price_str) || 15.0;

// Cancel/Ban number on 5SIM
if (order_id) {
  try {
    HTTP.get({
      url: "https://5sim.net/v1/user/ban/" + order_id,
      headers: {
        "Authorization": "Bearer " + MUSTAFA_5SIM_TOKEN,
        "Accept": "application/json"
      }
    });
  } catch(e) {}
}

// Refund balance in wallet
var cur_bal = parseFloat(Bot.getProperty("balance_" + uid) || User.getProperty("balance") || "0");
var refunded_bal = +(cur_bal + refund_price).toFixed(2);

Bot.setProperty("balance_" + uid, "" + refunded_bal, "string");
User.setProperty("balance", "" + refunded_bal, "string");

User.setProperty("current_active_order_id", null);
User.setProperty("current_active_phone", null);
User.setProperty("current_order_price", null);

var text = "🚫 *تم إلغاء الرقم بنجاح واسترداد الرصيد إلى محفظتك بالكامل!* ✅\n\n" +
  "💰 *المبلغ المسترد:* `+" + refund_price + " ₽`\n" +
  "💷 *رصيدك الحالي:* `*" + refunded_bal + " ₽*`\n\n" +
  "لم يتم خصم أي قرش من حسابك لأن كود التفعيل لم يصل.";

Bot.sendInlineKeyboard([
  [ { title: "☎️ شراء رقم من دولة أخرى", command: "Buynum" } ],
  [ { title: "🏡 القائمة الرئيسية", command: "/start" } ]
], text);
