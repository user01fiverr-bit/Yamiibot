const dl = require("../../lib/cobalt");
module.exports = { name: "facebook", aliases: ["fb"], category: "download", description: "Download Facebook video", usage: ".fb <url>", permission: "user", async run(ctx) { return await dl.download(ctx, false); } };
