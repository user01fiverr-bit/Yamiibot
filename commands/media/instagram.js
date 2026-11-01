const dl = require("./downloader");
module.exports = { name: "instagram", aliases: ["ig"], category: "media", description: "Download IG media", usage: ".instagram <url>", permission: "user", async run(ctx) { if(!ctx.args[0]) return "usage: .instagram <url>"; return await dl.run(ctx); } };
