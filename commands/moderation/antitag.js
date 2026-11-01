const mod = require("../../lib/moderation");
module.exports = { name: "antitag", category: "moderation", description: "Toggle antitag", usage: ".antitag on/off", permission: "user", async run(ctx) { if(!ctx.jid.endsWith("@g.us")) return "Group only"; const state = ctx.args[0]?.toLowerCase() === "on"; mod.setGroup(ctx.jid, "antitag", state); return `✅ ${state ? "ON" : "OFF"}: antitag`; } };
