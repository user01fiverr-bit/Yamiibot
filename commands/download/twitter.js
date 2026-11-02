const dl = require("../../lib/cobalt");
module.exports = { name: "twitter", aliases: ["x"], category: "download", description: "Download X video", usage: ".twitter <url>", permission: "user", async run(ctx) { return await dl.download(ctx, false); } };
