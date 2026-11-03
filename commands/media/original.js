const { downloadMediaMessage } = require("@whiskeysockets/baileys");

module.exports = {
  name: "original",
  aliases: ["toimage", "tovideo"],
  category: "media",
  description: "Convert a sticker back to its original image or video",
  usage: "reply to a sticker with .original",
  permission: "user",
  async run(ctx) {
    // 1. Tell us the command fired at all
    console.log("[ORIGINAL CMD] Command triggered. Checking quote...");
    
    // 2. Try to get the quote. Some engines use ctx.m, some use ctx.msg
    const rawMsg = ctx.m || ctx.msg || ctx.message;
    const q = ctx.quotedRaw || ctx.quoted || rawMsg?.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    if (!q) {
      console.log("[ORIGINAL CMD] No quote found. Dropping.");
      return "⚠️ Reply to a sticker with `.original`.";
    }

    // 3. If we find the quote, log its keys so we can see what it is
    console.log("[ORIGINAL CMD] Quote found. Keys:", Object.keys(q));
    
    // Unwrap wrappers
    let inner = q.message || q;
    if (inner.viewOnceMessageV2) inner = inner.viewOnceMessageV2.message;
    else if (inner.viewOnceMessageV2Extension) inner = inner.viewOnceMessageV2Extension.message;
    else if (inner.viewOnceMessage) inner = inner.viewOnceMessage.message;
    else if (inner.documentWithCaptionMessage) inner = inner.documentWithCaptionMessage.message;

    const stickerMsg = inner.stickerMessage;

    if (!stickerMsg) {
      console.log("[ORIGINAL CMD] Inner keys:", Object.keys(inner));
      return "⚠️ That is not a sticker. Reply to a sticker.";
    }

    try {
      const buf = await downloadMediaMessage(
        { key: q.key || rawMsg.message.extendedTextMessage.contextInfo.stanzaId, message: inner },
        "buffer",
        {},
        { logger: console, reuploadRequest: ctx.sock.updateMediaMessage }
      );

      if (!buf || !buf.length) return "❌ Failed to download sticker.";

      if (!!stickerMsg.isAnimated) {
        await ctx.sock.sendMessage(ctx.jid, { video: buf, mimetype: "video/mp4", caption: "🎥 Original Video" }, { quoted: q });
      } else {
        await ctx.sock.sendMessage(ctx.jid, { image: buf, mimetype: "image/webp", caption: "🖼️ Original Image" }, { quoted: q });
      }
    } catch (e) {
      console.log("[ORIGINAL CMD] Crash:", e);
      return "❌ Failed to convert: " + e.message;
    }
  }
};
