/*
  Command: buy_mohammed
  Description: Purchase via the active 5SIM / Mustafa server directly
*/

var svc = "whatsapp";
if (typeof params !== "undefined" && params) {
  var p = ("" + params).trim().toLowerCase();
  if (p.indexOf("tg") !== -1 || p.indexOf("telegram") !== -1) svc = "telegram";
}

if (svc === "telegram") {
  Bot.runCommand("Xi tg colombia 10");
} else {
  Bot.runCommand("Xi wa colombia 15");
}
