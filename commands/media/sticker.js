const fs = require("fs");
const path = require("path");
const os = require("os");
const { execFile } = require("child_process");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");

module.exports = {
  name: "sticker",
  aliases: ["s"],
  category: "media",
  description: "Turn a replied image into a WhatsApp sticker",
  usage: "reply to an image with .sticker",
  permission: "user",
  async run(ctx) {
    const quoted = ctx.quotedRaw;
    if (!quoted) return "reply to an image with .sticker";
    const inner = quoted.message || {};
    const kind = Object.keys(inner).find((k) => ["imageMessage", "videoMessage"].includes(k));
    if (!kind) return "reply to an image or a short video";

    await ctx.reply("building sticker…");
    const ext = kind === "imageMessage" ? "jpg" : "mp4";
    const tmpIn = path.join(os.tmpdir(), "stk-in-" + Date.now() + "." + ext);
    const tmpOut = path.join(os.tmpdir(), "stk-out-" + Date.now() + ".webp");

    try {
      const buf = await downloadMediaMessage({ key: quoted.key, message: inner }, "buffer", {}, { logger: console, reuploadRequest: ctx.sock.updateMediaMessage });
      fs.writeFileSync(tmpIn, buf);
      const args = kind === "imageMessage"
        ? ["-y", "-i", tmpIn, "-vf", "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000", "-vcodec", "libwebp", "-lossless", "1", "-q:v", "80", tmpOut]
        : ["-y", "-i", tmpIn, "-t", "3", "-vf", "scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000", "-vcodec", "libwebp", "-lossless", "0", "-q:v", "50", "-loop", "0", "-an", tmpOut];
      await new Promise((res, rej) => execFile("ffmpeg", args, (e) => (e ? rej(e) : res())));
      const webp = fs.readFileSync(tmpOut);
      await ctx.sock.sendMessage(ctx.jid, { sticker: webp }, { quoted: quoted });
      fs.unlinkSync(tmpIn); fs.unlinkSync(tmpOut);
    } catch (e) { return "sticker failed: " + e.message; }
  },
};
