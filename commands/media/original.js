const { downloadMediaMessage } = require("@whiskeysockets/baileys");

module.exports = {
  name: "original",
  aliases: ["toimage", "tovideo"],
  category: "media",
  description: "Convert a sticker back to its original image or video",
  usage: "reply to a sticker with .original",
  permission: "user",
  async run(ctx) {
    console.log("[ORIGINAL CMD] Triggered.");
    
    const q = ctx.quotedRaw;
    if (!q || !q.message) {
      return "⚠️ Reply to a sticker with `.original`.";
    }

    // 1. Unwrap the actual message node
    let inner = q.message;
    if (inner.viewOnceMessageV2) inner = inner.viewOnceMessageV2.message;
    else if (inner.viewOnceMessageV2Extension) inner = inner.viewOnceMessageV2Extension.message;
    else if (inner.viewOnceMessage) inner = inner.viewOnceMessage.message;
    else if (inner.documentWithCaptionMessage) inner = inner.documentWithCaptionMessage.message;

    if (!inner.stickerMessage) {
      console.log("[ORIGINAL CMD] Keys inside inner:", Object.keys(inner));
      return "⚠️ That is not a sticker. Reply to a sticker.";
    }

    try {
      // 2. Rebuild the exact key required by downloadMediaMessage
      const downloadKey = {
        remoteJid: ctx.jid,
        fromMe: q.key.fromMe,
        id: q.key.id,
        participant: q.key.participant || undefined
      };

      console.log("[ORIGINAL CMD] Attempting download...");
      
      const buf = await downloadMediaMessage(
        { key: downloadKey, message: inner },
        "buffer",
        {},
        { logger: console, reuploadRequest: ctx.sock.updateMediaMessage }
      );

      if (!buf || !buf.length) {
        console.log("[ORIGINAL CMD] Buffer is empty.");
        return "❌ Failed to download sticker (empty buffer).";
      }

      console.log("[ORIGINAL CMD] Success. Size:", buf.length);
      const isAnimated = !!inner.stickerMessage.isAnimated;

      if (isAnimated) {
        await ctx.sock.sendMessage(ctx.jid, { video: buf, mimetype: "video/mp4", caption: "🎥 Original Video" }, { quoted: q });
      } else {
        await ctx.sock.sendMessage(ctx.jid, { image: buf, mimetype: "image/webp", caption: "🖼️ Original Image" }, { quoted: q });
      }
    } catch (e) {
      console.log("[ORIGINAL CMD] FATAL ERROR:", e);
      return "❌ Failed: " + e.message;
    }
  }
};
