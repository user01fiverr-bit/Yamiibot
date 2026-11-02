const mod = require("../../lib/moderation");
module.exports = { name: "antispam", category: "moderation", description: "Toggle antispam", usage: ".antispam on/off", permission: "user", async run(ctx) { if(!ctx.jid.endsWith("@g.us")) return "Group only"; const state = ctx.args[0]?.toLowerCase() === "on"; mod.setGroup(ctx.jid, "antispam", state); return `✅ ${state ? "ON" : "OFF"}: antispam`; } };
