const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");

module.exports = {
  name: "original",
  category: "media",
  description: "Sticker to media",
  usage: "reply with .original",
  permission: "user",
  async run(ctx) {
    const q = ctx.quotedRaw;
    if (!q || !q.message.stickerMessage) return "reply to a sticker";

    const tmpDir = path.join(process.cwd(), "tmp");
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

    const tmpIn = path.join(tmpDir, "in-" + Date.now() + ".webp");
    const tmpOutImg = path.join(tmpDir, "out-" + Date.now() + ".png");

    try {
      const buf = await downloadMediaMessage({ key: q.key, message: q.message }, "buffer", {}, { logger: console, reuploadRequest: ctx.sock.updateMediaMessage });
      fs.writeFileSync(tmpIn, buf);

      // Pure JS check for video sticker (zero memory used)
      const isAnimated = buf.toString('ascii').includes('ANIM');

      if (isAnimated) {
        return "⚠️ Video stickers are not supported on this free host due to memory limits.";
      }

      // If it's an image sticker, use the system's ffmpeg to convert it
      await new Promise((res, rej) => {
          exec(`ffmpeg -y -i "${tmpIn}" "${tmpOutImg}"`, (err, stdout, stderr) => {
              if (err) return rej(new Error(stderr || err.message));
              res();
          });
      });
      
      await ctx.sock.sendMessage(ctx.jid, { image: fs.readFileSync(tmpOutImg), caption: "🖼️ Original Image" }, { quoted: q });
      
      if (fs.existsSync(tmpOutImg)) fs.unlinkSync(tmpOutImg);
      if (fs.existsSync(tmpIn)) fs.unlinkSync(tmpIn);
    } catch (e) {
      return "failed: " + e.message;
    }
  }
};
