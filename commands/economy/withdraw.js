const eco = require("../../lib/economy");
module.exports = { name: "withdraw", aliases: ["with"], category: "economy", description: "Withdraw from bank", usage: ".withdraw 500", permission: "user", async run(ctx) {
  const user = eco.getUser(ctx.ownerWa);
  const amt = parseInt(ctx.args[0]);
  if (isNaN(amt) || amt <= 0) return "usage: .withdraw <amount>";
  if (user.bank < amt) return "❌ You don't have that much in the bank.";
  user.wallet += amt; user.bank -= amt; eco.saveUser(ctx.ownerWa, user);
  return `✅ Withdrew ${amt} coins to your wallet.`;
} };
