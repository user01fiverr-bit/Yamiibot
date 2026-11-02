const https = require("https");
function postJson(url, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const data = JSON.stringify(body);
    const req = https.request({
      hostname: u.hostname, path: u.pathname, method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json", "Content-Length": Buffer.byteLength(data) }
    }, (res) => {
      let out = "";
      res.on("data", (c) => out += c);
      res.on("end", () => { try { resolve(JSON.parse(out)); } catch(e) { reject(e); } });
    });
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}
async function download(ctx, isAudio = false) {
  if (!ctx.args[0]) return "⚠️ Provide a link.\nExample: `.command <url>`";
  await ctx.reply("🔍 Fetching media...");
  try {
    const res = await postJson("https://api.cobalt.tools/api/json", { url: ctx.args[0], isAudioOnly: isAudio });
    if (res.status === "error") return "❌ Error: " + res.text;
    const mediaUrl = res.url;
    if (!mediaUrl) return "❌ Could not find media at that link.";
    
    // We send the URL directly so WhatsApp handles the download, saving server RAM!
    if (isAudio) {
      await ctx.sock.sendMessage(ctx.jid, { audio: { url: mediaUrl }, mimetype: "audio/mp4" }, { quoted: ctx.quotedRaw });
    } else {
      await ctx.sock.sendMessage(ctx.jid, { video: { url: mediaUrl }, caption: "Downloaded by Yamii AI" }, { quoted: ctx.quotedRaw });
    }
  } catch (e) {
    return "❌ Failed: " + e.message;
  }
}
module.exports = { download };
