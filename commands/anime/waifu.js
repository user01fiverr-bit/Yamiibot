const https = require("https");
function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) return fetchBuffer(res.headers.location).then(resolve).catch(reject);
      const chunks = []; res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
    }).on("error", reject);
  });
}
module.exports = { name: "waifu", category: "anime", description: "Random waifu image", usage: ".waifu", permission: "user", async run(ctx) {
  await ctx.reply("fetching...");
  try {
    const r = await fetch("https://api.waifu.pics/sfw/waifu");
    const j = await r.json();
    const buf = await fetchBuffer(j.url);
    await ctx.sock.sendMessage(ctx.jid, { image: buf, caption: "🌸 Waifu" }, { quoted: ctx.quotedRaw });
  } catch (e) { return "failed to fetch image."; }
} };
