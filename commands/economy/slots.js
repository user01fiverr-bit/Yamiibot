const eco = require("../../lib/economy");
module.exports = { name: "slots", category: "economy", description: "Spin the slot machine", usage: ".slots 100", permission: "user", async run(ctx) {
  const user = eco.getUser(ctx.ownerWa);
  const amt = parseInt(ctx.args[0]) || 100;
  if (user.wallet < amt) return "❌ Not enough coins in wallet.";
  const icons = ["🍒", "🍋", "🍊", "⭐", "💎", "7️⃣"];
  const res = [icons[Math.floor(Math.random()*6)], icons[Math.floor(Math.random()*6)], icons[Math.floor(Math.random()*6)]];
  
  let msg = `🎰 [ ${res.join(" | ")} ]\n`;
  if (res[0] === res[1] && res[1] === res[2]) {
    user.wallet += amt * 5; eco.saveUser(ctx.ownerWa, user);
    msg += `🎉 *JACKPOT!* You won ${amt * 5} coins!`;
  } else if (res[0] === res[1] || res[1] === res[2] || res[0] === res[2]) {
    user.wallet += amt; eco.saveUser(ctx.ownerWa, user);
    msg += `✨ *Small Win!* You got your bet back (${amt} coins).`;
  } else {
    user.wallet -= amt; eco.saveUser(ctx.ownerWa, user);
    msg += `❌ *You lost* ${amt} coins.`;
  }
  return msg;
} };
