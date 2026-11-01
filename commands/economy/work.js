const eco = require("../../lib/economy");
module.exports = { name: "work", category: "economy", description: "Work for coins (30m)", usage: ".work", permission: "user", async run(ctx) {
  const user = eco.getUser(ctx.ownerWa);
  const now = Date.now();
  if (now - user.lastWork < 1800000) {
    const mins = Math.ceil((1800000 - (now - user.lastWork)) / 60000);
    return `⏳ You are tired. Rest for ${mins} more minutes.`;
  }
  const earned = Math.floor(Math.random() * 200) + 50;
  user.wallet += earned; user.lastWork = now; eco.saveUser(ctx.ownerWa, user);
  return `💼 *Work Complete!* You earned ${earned} coins.\nWallet: ${user.wallet}`;
} };
