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
    const tmpOutVid = path.join(tmpDir, "out-" + Date.now() + ".mp4");
    const tmpOutImg = path.join(tmpDir, "out-" + Date.now() + ".png");

    try {
      const buf = await downloadMediaMessage({ key: q.key, message: q.message }, "buffer", {}, { logger: console, reuploadRequest: ctx.sock.updateMediaMessage });
      fs.writeFileSync(tmpIn, buf);

      // Pure JS way to detect animated WebP (checks for 'ANIM' chunk in header)
      const isAnimated = buf.length > 16 && buf.toString('ascii', 12, 16) === 'ANIM';

      if (isAnimated) {
        await new Promise((res, rej) => {
            // USE SYSTEM FFMPEG DIRECTLY
            exec(`ffmpeg -y -i "${tmpIn}" -c:v libx264 -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" "${tmpOutVid}"`, (err, stdout, stderr) => {
                if (err) return rej(new Error(stderr || err.message));
                res();
            });
        });
        await ctx.sock.sendMessage(ctx.jid, { video: fs.readFileSync(tmpOutVid), caption: "🎥 Original Video" }, { quoted: q });
        fs.unlinkSync(tmpOutVid);
      } else {
        await new Promise((res, rej) => {
            // USE SYSTEM FFMPEG DIRECTLY
            exec(`ffmpeg -y -i "${tmpIn}" "${tmpOutImg}"`, (err, stdout, stderr) => {
                if (err) return rej(new Error(stderr || err.message));
                res();
            });
        });
        await ctx.sock.sendMessage(ctx.jid, { image: fs.readFileSync(tmpOutImg), caption: "🖼️ Original Image" }, { quoted: q });
        fs.unlinkSync(tmpOutImg);
      }
      fs.unlinkSync(tmpIn);
    } catch (e) {
      return "failed: " + e.message;
    }
  }
};
