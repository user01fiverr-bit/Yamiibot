const fs = require("fs");
const path = require("path");
const os = require("os");
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

    const tmpIn = path.join(os.tmpdir(), "in-" + Date.now() + ".webp");
    const tmpOutVid = path.join(os.tmpdir(), "out-" + Date.now() + ".mp4");
    const tmpOutImg = path.join(os.tmpdir(), "out-" + Date.now() + ".png");

    try {
      const buf = await downloadMediaMessage({ key: q.key, message: q.message }, "buffer", {}, { logger: console, reuploadRequest: ctx.sock.updateMediaMessage });
      fs.writeFileSync(tmpIn, buf);

      // Check if it is a video sticker (animated)
      const isAnimated = buf.toString('ascii', 0, 100).includes('ANIM');

      if (isAnimated) {
        await new Promise((res, rej) => execFile(ffmpegPath, ["-y", "-i", tmpIn, "-c:v", "libx264", "-pix_fmt", "yuv420p", tmpOutVid], (e) => e ? rej(e) : res()));
        await ctx.sock.sendMessage(ctx.jid, { video: fs.readFileSync(tmpOutVid), caption: "🎥 Original Video" }, { quoted: q });
        fs.unlinkSync(tmpOutVid);
      } else {
        await execFile(ffmpegPath, ["-y", "-i", tmpIn, tmpOutImg]);
        await ctx.sock.sendMessage(ctx.jid, { image: fs.readFileSync(tmpOutImg), caption: "🖼️ Original Image" }, { quoted: q });
        fs.unlinkSync(tmpOutImg);
      }
      fs.unlinkSync(tmpIn);
    } catch (e) {
      return "failed: " + e.message;
    }
  }
};
