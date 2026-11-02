const crypto = require("crypto");
module.exports = { name: "hash", category: "tools", description: "Hash text", usage: ".hash <alg> <text>", permission: "user", async run(ctx) { const alg=(ctx.args[0]||"sha256").toLowerCase(); const txt=ctx.args.slice(1).join(" "); try{ return crypto.createHash(alg).update(txt).digest("hex"); }catch{ return "bad algorithm"; } } };
