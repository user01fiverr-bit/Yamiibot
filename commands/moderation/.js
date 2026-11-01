const mod = require("../../lib/moderation");
module.exports = { name: "", category: "moderation", description: "Toggle ", usage: ". on/off", permission: "user", async run(ctx) {
  if (!ctx.jid.endsWith("@g.us")) return "❌ Group only command.";
  const state = ctx.args[0]?.toLowerCase() === "on";
  mod.setGroup(ctx.jid, "", state);
  return `✅ ${state ? "Enabled" : "Disabled"} `;
} };
