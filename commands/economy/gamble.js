const eco = require("../../lib/economy");
module.exports = { name: "gamble", category: "economy", description: "Double or nothing", usage: ".gamble 100", permission: "user", async run(ctx) {
  const user = eco.getUser(ctx.ownerWa);
  const amt = parseInt(ctx.args[0]);
  if (isNaN(amt) || amt <= 0) return "usage: .gamble <amount>";
  if (user.wallet < amt) return "❌ Not enough coins in wallet.";
  if (Math.random() < 0.45) {
    user.wallet += amt; eco.saveUser(ctx.ownerWa, user);
    return `🎰 *YOU WON!* You doubled your bet. +${amt} coins.`;
  } else {
    user.wallet -= amt; eco.saveUser(ctx.ownerWa, user);
    return `🎰 *YOU LOST!* You lost ${amt} coins.`;
  }
} };
