const dl = require("../../lib/cobalt");
module.exports = { name: "instagram", aliases: ["ig"], category: "download", description: "Download IG media", usage: ".ig <url>", permission: "user", async run(ctx) { return await dl.download(ctx, false); } };
