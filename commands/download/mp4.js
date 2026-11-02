const dl = require("../../lib/cobalt");
module.exports = { name: "mp4", category: "download", description: "Download video", usage: ".mp4 <url>", permission: "user", async run(ctx) { return await dl.download(ctx, false); } };
