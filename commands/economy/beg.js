const eco = require("../../lib/economy");
module.exports = { name: "beg", category: "economy", description: "Beg for coins", usage: ".beg", permission: "user", async run(ctx) { const u=eco.getUser(ctx.ownerWa); const amt=Math.floor(Math.random()*50); u.wallet+=amt; eco.saveUser(ctx.ownerWa,u); return `🙏 You begged and got ${amt} coins!`; } };
