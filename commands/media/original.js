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
    
    // Debug: This prints the raw quoted object to the bot hosting console
    if (!q || !q.message) {
      console.log("[ORIGINAL CMD] No quote found. q =", q);
      return "⚠️ Reply to a sticker with `.original`.";
    }

    // Deep unwrap (handles view-once, documents, and normal)
    let inner = q.message;
    if (inner.viewOnceMessageV2) inner = inner.viewOnceMessageV2.message;
    else if (inner.viewOnceMessageV2Extension) inner = inner.viewOnceMessageV2Extension.message;
    else if (inner.viewOnceMessage) inner = inner.viewOnceMessage.message;
    else if (inner.documentWithCaptionMessage) inner = inner.documentWithCaptionMessage.message;

    // Find the sticker (sometimes it's called stickerMessage, sometimes it's nested)
    const stickerMsg = inner.stickerMessage;

    if (!stickerMsg) {
      console.log("[ORIGINAL CMD] Not a sticker. Found keys:", Object.keys(inner));
      return "⚠️ That is not a sticker. Reply to a sticker.";
    }

    try {
      const buf = await downloadMediaMessage(
        { key: q.key, message: inner },
        "buffer",
        {},
        { logger: console, reuploadRequest: ctx.sock.updateMediaMessage }
      );

      if (!buf || !buf.length) return "❌ Failed to download sticker. (Buffer empty)";

      const isAnimated = !!stickerMsg.isAnimated;

      if (isAnimated) {
        await ctx.sock.sendMessage(
          ctx.jid,
          { video: buf, mimetype: "video/mp4", caption: "🎥 Original Video" },
          { quoted: q }
        );
      } else {
        await ctx.sock.sendMessage(
          ctx.jid,
          { image: buf, mimetype: "image/webp", caption: "🖼️ Original Image" },
          { quoted: q }
        );
      }
    } catch (e) {
      console.log("[ORIGINAL CMD] Error:", e);
      return "❌ Failed to convert: " + e.message;
    }
  }
};
