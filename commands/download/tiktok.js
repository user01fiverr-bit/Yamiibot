const dl = require("../../lib/cobalt");
module.exports = { name: "tiktok", aliases: ["tt"], category: "download", description: "Download TikTok video", usage: ".tiktok <url>", permission: "user", async run(ctx) { return await dl.download(ctx, false); } };
