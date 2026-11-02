const mod = require("../../lib/moderation");
module.exports = { name: "antiraid", category: "moderation", description: "Toggle antiraid", usage: ".antiraid on/off", permission: "user", async run(ctx) { if(!ctx.jid.endsWith("@g.us")) return "Group only"; const state = ctx.args[0]?.toLowerCase() === "on"; mod.setGroup(ctx.jid, "antiraid", state); return `✅ ${state ? "ON" : "OFF"}: antiraid`; } };
