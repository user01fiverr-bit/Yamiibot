const crypto = require("crypto");
module.exports = { name: "sha1", category: "tools", description: "SHA1 Hash", usage: ".sha1 <text>", permission: "user", async run(ctx) { return crypto.createHash("sha1").update(ctx.args.join(" ")).digest("hex"); } };
