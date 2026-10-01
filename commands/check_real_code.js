/*
  Command: check_real_code
  Description: Query real SMS verification code from 5SIM API
*/

var MUSTAFA_5SIM_TOKEN = "eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE4MTkxMzcxMTQsImlhdCI6MTc4NzYwMTExNCwicmF5IjoiNTZlYmFlNjg0NGQyMTAzZjAyZjUyMzJlYjVhODViNTEiLCJzdWIiOjQ0MzcwMDF9.qEpXfNoatnjn3MLJhQErUVmgfIJ-cP_laTBFdz8RkeMietQrjYqZnRHTd23NjPxVPwn0HpoAz4lAmOwTiuPjaUQkU2u9QCnh2i89MAedpfm2kosspiug1Ux6o7pJ-2fVqPGW27cQtGmOz-vZne997NCbdCc7eDxoX3ZknvorIu1ZmaCEnVlk2-t-YdHAi90GzVqjrvE0dZqZM4Mp-IgX8z71Bv1neikePV2RsE68hGMM8Z2bONHMeAqxhtezVcW0ykW1pCk_NLjcSnTWFXo_L_dgVvZLQnPB1n-ROqFan55gB-uEkuU0KN0gkvnozT9_N4wTWjAYiLTy1S3-vaooDA";

var order_id = ("" + (params || "")).trim() || User.getProperty("current_active_order_id");

if (!order_id) {
  Bot.sendMessage("⚠️ لا يوجد طلب نشط حالياً للتحقق من الكود.");
  return;
}

var check_url = "https://5sim.net/v1/user/check/" + order_id;

HTTP.get({
  url: check_url,
  headers: {
    "Authorization": "Bearer " + MUSTAFA_5SIM_TOKEN,
    "Accept": "application/json"
  },
  success: "on_check_code " + order_id
});
