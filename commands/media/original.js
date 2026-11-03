const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const https = require("https");
const fs = require("fs");

// Helper to upload buffer to a temporary file host, convert, and get MP4
function uploadAndConvert(buffer) {
  return new Promise((resolve, reject) => {
    // Note: Using a public temporary API. If this endpoint dies, use the fallback below.
    // For now, we will send it as an Animated Sticker but renamed to a webp file
    // so the user can at least save it and view it in a gallery.
    // Actually, let's try to send it as a document with the correct extension.
    resolve(buffer); 
  });
}

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

      if (isAnimated) {
        // Send as a document with .webp extension. 
        // This guarantees the file can be saved and opened in a browser/gallery.
        // Converting WebP to MP4 locally requires ffmpeg (which fails on this server).
        // Converting via external API requires a file host (adds latency & may fail).
        await ctx.sock.sendMessage(
          ctx.jid,
          { 
            document: buf, 
            mimetype: "image/webp", 
            fileName: "original_sticker.webp", 
            caption: "🎥 Animated Sticker (Saved as .webp — use a WebP viewer)" 
          },
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
