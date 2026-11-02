const dl = require("../../lib/cobalt");
module.exports = { name: "yt", aliases: ["youtube"], category: "download", description: "Download YouTube video", usage: ".yt <url>", permission: "user", async run(ctx) { return await dl.download(ctx, false); } };
