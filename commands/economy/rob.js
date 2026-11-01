const eco = require("../../lib/economy");
module.exports = { name: "rob", category: "economy", description: "Steal coins (risky)", usage: ".rob @user", permission: "user", async run(ctx) {
  const target = ctx.quotedRaw?.key?.participant || (ctx.args[0] ? ctx.args[0].replace(/\D/g, "") + "@s.whatsapp.net" : null);
  if (!target) return "usage: .rob @user";
  const user = eco.getUser(ctx.ownerWa); const targetEco = eco.getUser(target);
  if (targetEco.wallet < 100) return "❌ Target is too poor.";
  if (Math.random() < 0.4) {
    const amt = Math.floor(targetEco.wallet * 0.2);
    user.wallet += amt; targetEco.wallet -= amt;
    eco.saveUser(ctx.ownerWa, user); eco.saveUser(target, targetEco);
    return `🦹 *SUCCESS!* You robbed ${amt} coins.`;
  } else {
    const fine = 200;
    user.wallet -= fine; eco.saveUser(ctx.ownerWa, user);
    return `🚔 *CAUGHT!* You paid a ${fine} coin fine.`;
  }
} };
