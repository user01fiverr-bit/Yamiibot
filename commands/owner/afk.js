const afk = require("../../lib/afk");
module.exports = { name: "afk", aliases: ["away"], category: "owner", description: "Turn AI auto-reply on/off", usage: ".afk on/off", permission: "user", async run(ctx) {
  const state = ctx.args[0]?.toLowerCase();
  if (state === "on") {
    const current = afk.getAfk(ctx.ownerWa);
    afk.setAfk(ctx.ownerWa, true, current.prompt);
    return "🤖 *Away Mode ON*.\nThe AI will now reply to anyone who messages you.";
  } else if (state === "off") {
    const current = afk.getAfk(ctx.ownerWa);
    afk.setAfk(ctx.ownerWa, false, current.prompt);
    return "🛑 *Away Mode OFF*.\nThe AI will stop replying.";
  }
  return "usage: .afk on/off";
} };
