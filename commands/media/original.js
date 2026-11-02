const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const sharp = require("sharp");

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
    const tmpGif = path.join(tmpDir, "temp-" + Date.now() + ".gif");

    try {
      const buf = await downloadMediaMessage({ key: q.key, message: q.message }, "buffer", {}, { logger: console, reuploadRequest: ctx.sock.updateMediaMessage });
      fs.writeFileSync(tmpIn, buf);

      // Use sharp to check if it is animated (has multiple pages)
      const metadata = await sharp(buf).metadata();
      const isAnimated = metadata.pages && metadata.pages > 1;

      if (isAnimated) {
        // 1. Convert animated WebP to GIF using sharp
        await sharp(buf, { animated: true }).gif().toFile(tmpGif);
        
        // 2. Convert GIF to MP4 using the system ffmpeg
        await new Promise((res, rej) => {
            exec(`ffmpeg -y -i "${tmpGif}" -c:v libx264 -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" "${tmpOutVid}"`, (err, stdout, stderr) => {
                if (err) return rej(new Error(stderr || err.message));
                res();
            });
        });
        
        await ctx.sock.sendMessage(ctx.jid, { video: fs.readFileSync(tmpOutVid), caption: "🎥 Original Video" }, { quoted: q });
        
        if (fs.existsSync(tmpOutVid)) fs.unlinkSync(tmpOutVid);
        if (fs.existsSync(tmpGif)) fs.unlinkSync(tmpGif);
      } else {
        // Static image
        await sharp(buf).png().toFile(tmpOutImg);
        await ctx.sock.sendMessage(ctx.jid, { image: fs.readFileSync(tmpOutImg), caption: "🖼️ Original Image" }, { quoted: q });
        if (fs.existsSync(tmpOutImg)) fs.unlinkSync(tmpOutImg);
      }
      if (fs.existsSync(tmpIn)) fs.unlinkSync(tmpIn);
    } catch (e) {
      return "failed: " + e.message;
    }
  }
};
