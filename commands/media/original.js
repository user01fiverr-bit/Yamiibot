const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffmpegPath = ffmpegInstaller.path;

module.exports = {
  name: "original",
  category: "media",
  description: "Sticker to media",
  usage: "reply with .original",
  permission: "user",
  async run(ctx) {
    const q = ctx.quotedRaw;
    if (!q || !q.message.stickerMessage) return "reply to a sticker";

    // FIX: Use the bot's own directory instead of the blocked /tmp folder
    const tmpDir = path.join(process.cwd(), "tmp");
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

    const tmpIn = path.join(tmpDir, "in-" + Date.now() + ".webp");
    const tmpOutVid = path.join(tmpDir, "out-" + Date.now() + ".mp4");
    const tmpOutImg = path.join(tmpDir, "out-" + Date.now() + ".png");

    try {
      const buf = await downloadMediaMessage({ key: q.key, message: q.message }, "buffer", {}, { logger: console, reuploadRequest: ctx.sock.updateMediaMessage });
      fs.writeFileSync(tmpIn, buf);

      const isAnimated = buf.toString('ascii', 0, 100).includes('ANIM');

      if (isAnimated) {
        await new Promise((res, rej) => execFile(ffmpegPath, [
          "-y", "-i", tmpIn, 
          "-c:v", "libx264", 
          "-pix_fmt", "yuv420p",
          "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2", 
          tmpOutVid
        ], (e, stdout, stderr) => e ? rej(new Error(stderr || e.message)) : res()));
        
        await ctx.sock.sendMessage(ctx.jid, { video: fs.readFileSync(tmpOutVid), caption: "🎥 Original Video" }, { quoted: q });
        fs.unlinkSync(tmpOutVid);
      } else {
        await new Promise((res, rej) => execFile(ffmpegPath, ["-y", "-i", tmpIn, tmpOutImg], (e, stdout, stderr) => e ? rej(new Error(stderr || e.message)) : res()));
        
        await ctx.sock.sendMessage(ctx.jid, { image: fs.readFileSync(tmpOutImg), caption: "🖼️ Original Image" }, { quoted: q });
        fs.unlinkSync(tmpOutImg);
      }
      fs.unlinkSync(tmpIn);
    } catch (e) {
      console.log("FFMPEG ERROR:", e.message);
      return "failed: " + e.message;
    }
  }
};
