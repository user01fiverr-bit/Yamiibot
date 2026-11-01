const fs = require("fs"); const path = require("path"); const os = require("os"); const { execFile } = require("child_process");
module.exports = { name: "video", category: "media", description: "Download video (Cloud only)", usage: ".video <url>", permission: "user", async run(ctx) {
  if (process.platform === "android") return "❌ Downloading requires yt-dlp. This command will work automatically when you move to the Cloud.";
  if (!ctx.args[0]) return "usage: .video <url>";
  await ctx.reply("fetching video...");
  const tmpOut = path.join(os.tmpdir(), "ytdl-" + Date.now() + ".mp4");
  try {
    await new Promise((res, rej) => execFile("yt-dlp", ["-f", "mp4", "-o", tmpOut, ctx.args[0]], (e) => e ? rej(e) : res()));
    await ctx.sock.sendMessage(ctx.jid, { video: fs.readFileSync(tmpOut), caption: "Downloaded by Yamii AI" }, { quoted: ctx.quotedRaw });
    fs.unlinkSync(tmpOut);
  } catch(e) { return "download failed: " + e.message; }
} };
