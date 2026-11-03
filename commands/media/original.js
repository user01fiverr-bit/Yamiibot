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

    let inner = q.message;
    if (inner.viewOnceMessageV2) inner = inner.viewOnceMessageV2.message;
    else if (inner.viewOnceMessageV2Extension) inner = inner.viewOnceMessageV2Extension.message;
    else if (inner.viewOnceMessage) inner = inner.viewOnceMessage.message;
    else if (inner.documentWithCaptionMessage) inner = inner.documentWithCaptionMessage.message;

    if (!inner.stickerMessage) return "⚠️ That is not a sticker. Reply to a sticker.";

    try {
      const downloadKey = {
        remoteJid: ctx.jid,
        fromMe: q.key.fromMe,
        id: q.key.id,
        participant: q.key.participant || undefined
      };

      const buf = await downloadMediaMessage(
        { key: downloadKey, message: inner },
        "buffer",
        {},
        { logger: console, reuploadRequest: ctx.sock.updateMediaMessage }
      );

      if (!buf || !buf.length) return "❌ Failed to download sticker (empty buffer).";

      const isAnimated = !!inner.stickerMessage.isAnimated;

      // Force standard image mimetype (bypasses WA webp rejection)
      if (isAnimated) {
        await ctx.sock.sendMessage(
          ctx.jid,
          { video: buf, mimetype: "video/mp4", caption: "🎥 Original Video" },
          { quoted: q }
        );
      } else {
        await ctx.sock.sendMessage(
          ctx.jid,
          { image: buf, mimetype: "image/jpeg", caption: "🖼️ Original Image" },
          { quoted: q }
        );
      }
    } catch (e) {
      console.log("[ORIGINAL CMD] FATAL ERROR:", e);
      return "❌ Failed: " + e.message;
    }
  }
};
