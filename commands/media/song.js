const dl = require("./downloader");
module.exports = { name: "song", aliases: ["play"], category: "media", description: "Download audio from YT", usage: ".song <query or url>", permission: "user", async run(ctx) { if(!ctx.args.length) return "usage: .song <query>"; return await dl.run(ctx); } };
