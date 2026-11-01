const eco = require("../../lib/economy");
module.exports = { name: "balance", aliases: ["bal"], category: "economy", description: "Your wallet & bank", usage: ".balance", permission: "user", async run(ctx) {
  const user = eco.getUser(ctx.ownerWa);
  return `🏦 *Your Balance*\n💵 Wallet: ${user.wallet}\n🏦 Bank: ${user.bank}\n\nTotal: ${user.wallet + user.bank} coins`;
} };
