const eco = require("../../lib/economy");
module.exports = { name: "deposit", aliases: ["dep"], category: "economy", description: "Deposit coins to bank", usage: ".deposit 500", permission: "user", async run(ctx) {
  const user = eco.getUser(ctx.ownerWa);
  const amt = parseInt(ctx.args[0]);
  if (isNaN(amt) || amt <= 0) return "usage: .deposit <amount>";
  if (user.wallet < amt) return "❌ You don't have that much in your wallet.";
  user.wallet -= amt; user.bank += amt; eco.saveUser(ctx.ownerWa, user);
  return `✅ Deposited ${amt} coins to the bank.`;
} };
