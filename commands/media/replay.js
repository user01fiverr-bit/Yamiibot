const { downloadMediaMessage } = require("@whiskeysockets/baileys");

module.exports = {
  name: "replay",
  category: "media",
  description: "Resend replied media (image, video, audio)",
  usage: "reply with .replay",
  permission: "user",
  async run(ctx) {
    const q = ctx.quotedRaw;
    if (!q || !q.message) return "⚠️ Reply to an image, video, or voice note with `.replay`.";

    // Find the type of media
    const inner = q.message.viewOnceMessageV2?.message || q.message.viewOnceMessage?.message || q.message;
    const type = Object.keys(inner).find(k => 
      ["imageMessage", "videoMessage", "audioMessage"].includes(k)
    );

    if (!type) return "⚠️ Unsupported media type. Reply to an image, video, or voice note.";

    try {
      // Download the exact file into memory
      const buf = await downloadMediaMessage(
        { key: q.key, message: inner },
        "buffer", {}, 
        { logger: console, reuploadRequest: ctx.sock.updateMediaMessage }
      );

      if (!buf || !buf.length) return "❌ Failed to download media.";

      const opts = { quoted: q };

      // Send it right back based on what it is
      if (type === "imageMessage") {
        await ctx.sock.sendMessage(ctx.jid, { image: buf, caption: "🖼️ Image" }, opts);
      } else if (type === "videoMessage") {
        await ctx.sock.sendMessage(ctx.jid, { video: buf, caption: "🎥 Video" }, opts);
      } else if (type === "audioMessage") {
        // Check if it was a voice note or a normal audio file
        const isPtt = inner.audioMessage.ptt;
        await ctx.sock.sendMessage(ctx.jid, { 
            audio: buf, 
            mimetype: "audio/ogg; codecs=opus", 
            ptt: isPtt 
        }, opts);
      }
    } catch (e) {
      return "❌ Replay failed: " + e.message;
    }
  }
};
