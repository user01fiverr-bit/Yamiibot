const https = require("https");

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) return fetchBuffer(res.headers.location).then(resolve).catch(reject);
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
    }).on("error", reject);
  });
}

function postJson(url, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const data = JSON.stringify(body);
    const req = https.request({ hostname: u.hostname, path: u.pathname, method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json", "Content-Length": Buffer.byteLength(data) } }, (res) => {
      let out = "";
      res.on("data", (c) => out += c);
      res.on("end", () => resolve(JSON.parse(out)));
    });
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

async function downloadMedia(ctx, url, type) {
  if (!url) return "Please provide a valid link.";
  await ctx.reply("fetching media...");
  try {
    const apiRes = await postJson("https://api.cobalt.tools/api/json", { url: url });
    if (apiRes.status === "error") return "Error: " + apiRes.text;
    const mediaUrl = apiRes.url;
    const buf = await fetchBuffer(mediaUrl);
    
    if (type === "audio" || apiRes.audio) {
      await ctx.sock.sendMessage(ctx.jid, { audio: buf, mimetype: "audio/mp4" }, { quoted: ctx.quotedRaw });
    } else {
      await ctx.sock.sendMessage(ctx.jid, { video: buf, caption: "Downloaded by Yamii AI" }, { quoted: ctx.quotedRaw });
    }
  } catch (e) {
    return "download failed: " + e.message;
  }
}

module.exports = {
  name: "video",
  category: "media",
  description: "Download video (YT, Twitter, FB)",
  usage: ".video <url>",
  permission: "user",
  async run(ctx) {
    if (!ctx.args[0]) return "usage: .video <url>";
    return await downloadMedia(ctx, ctx.args[0], "video");
  }
};
