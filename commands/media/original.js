const fs = require("fs");
const path = require("path");
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
    const tmpOutVid = path.join(tmpDir, "out-" + Date.now() + ".gif");
    const tmpOutImg = path.join(tmpDir, "out-" + Date.now() + ".png");

    try {
      const buf = await downloadMediaMessage({ key: q.key, message: q.message }, "buffer", {}, { logger: console, reuploadRequest: ctx.sock.updateMediaMessage });
      fs.writeFileSync(tmpIn, buf);

      const metadata = await sharp(buf).metadata();
      const isAnimated = metadata.pages && metadata.pages > 1;

      if (isAnimated) {
        // Use sharp to convert the animated webp directly into a GIF
        await sharp(buf, { animated: true }).gif().toFile(tmpOutVid);
        
        await ctx.sock.sendMessage(ctx.jid, { 
          video: fs.readFileSync(tmpOutVid), 
          caption: "🎥 Original Video" 
        }, { quoted: q });
        
        if (fs.existsSync(tmpOutVid)) fs.unlinkSync(tmpOutVid);
      } else {
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
