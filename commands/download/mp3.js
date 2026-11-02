const dl = require("../../lib/cobalt");
module.exports = { name: "mp3", category: "download", description: "Extract audio", usage: ".mp3 <url>", permission: "user", async run(ctx) { return await dl.download(ctx, true); } };
