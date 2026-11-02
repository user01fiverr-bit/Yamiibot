const crypto = require("crypto");
module.exports = { name: "md5", category: "tools", description: "MD5 Hash", usage: ".md5 <text>", permission: "user", async run(ctx) { return crypto.createHash("md5").update(ctx.args.join(" ")).digest("hex"); } };
