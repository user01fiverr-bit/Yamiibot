const admin = require("../../lib/admin");
module.exports = { name: "unban", category: "admin", description: "Unban a user", usage: ".unban @user", permission: "user", async run(ctx) { const t = ctx.quotedRaw?.key?.participant || (ctx.args[0] ? ctx.args[0].replace(/\D/g,"")+"@s.whatsapp.net" : null); if(!t) return "Reply to a user."; admin.unban(t); return `✅ Unbanned @${t.split("@")[0]}`; } };
