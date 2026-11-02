const afk = require("../../lib/afk");
module.exports = { name: "setafk", category: "owner", description: "Set the AI instruction for away mode", usage: ".setafk I am asleep", permission: "user", async run(ctx) {
  if (!ctx.args.length) return "usage: .setafk <instructions for the AI>";
  const prompt = ctx.args.join(" ");
  const current = afk.getAfk(ctx.ownerWa);
  afk.setAfk(ctx.ownerWa, current.status, prompt);
  return `✅ *AFK Prompt updated:*\n"${prompt}"`;
} };
