const mod = require("../../lib/moderation");
module.exports = { name: "antilink", category: "moderation", description: "Toggle antilink", usage: ".antilink on/off", permission: "user", async run(ctx) { if(!ctx.jid.endsWith("@g.us")) return "Group only"; const state = ctx.args[0]?.toLowerCase() === "on"; mod.setGroup(ctx.jid, "antilink", state); return `✅ ${state ? "ON" : "OFF"}: antilink`; } };
