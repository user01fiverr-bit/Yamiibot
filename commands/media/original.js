const { downloadMediaMessage } = require("@whiskeysockets/baileys");

module.exports = {
  name: "original",
  aliases: ["toimage", "tovideo"],
  category: "media",
  description: "Convert a sticker back to its original image or video",
  usage: "reply to a sticker with .original",
  permission: "user",
  async run(ctx) {
    const q = ctx.quotedRaw;
    if (!q || !q.message) return "⚠️ Reply to a sticker with `.original`.";

    // Unwrap containers (view once, document with caption, etc)
    const inner =
      q.message.viewOnceMessageV2?.message ||
      q.message.viewOnceMessageV2Extension?.message ||
      q.message.viewOnceMessage?.message ||
      q.message;

    const stickerMsg = inner.stickerMessage;
    if (!stickerMsg) return "⚠️ That is not a sticker. Reply to a sticker.";

    try {
      // Download the webp buffer directly into RAM
      const buf = await downloadMediaMessage(
        { key: q.key, message: inner },
        "buffer",
        {},
        { logger: console, reuploadRequest: ctx.sock.updateMediaMessage }
      );

      if (!buf || !buf.length) return "❌ Failed to download sticker.";

      const isAnimated = !!stickerMsg.isAnimated;

      // Send it back based on the animation flag
      if (isAnimated) {
        // Send as MP4 (WhatsApp auto-plays it)
        await ctx.sock.sendMessage(
          ctx.jid,
          { video: buf, mimetype: "video/mp4", caption: "🎥 Original Video" },
          { quoted: q }
        );
      } else {
        // Send as Image
        await ctx.sock.sendMessage(
          ctx.jid,
          { image: buf, mimetype: "image/webp", caption: "🖼️ Original Image" },
          { quoted: q }
        );
      }
    } catch (e) {
      return "❌ Failed to convert: " + e.message;
    }
  }
};
