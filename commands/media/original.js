const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const https = require("https");
const crypto = require("crypto");

// Helper to POST data to a conversion API
function postToConvertApi(buffer) {
  return new Promise((resolve, reject) => {
    const boundary = "----WebKitFormBoundary" + crypto.randomBytes(8).toString("hex");
    const header = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="sticker.webp"\r\nContent-Type: image/webp\r\n\r\n`;
    const footer = `\r\n--${boundary}--\r\n`;
    
    const payload = Buffer.concat([
      Buffer.from(header),
      buffer,
      Buffer.from(footer)
    ]);

    // Using a reliable free conversion endpoint (CloudConvert free tier alternative)
    const req = https.request({
      hostname: "api.evogb.com",
      path: "/v1/convert/webp-to-mp4",
      method: "POST",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
        "Content-Length": payload.length
      }
    }, (res) => {
      let data = "";
      res.on("data", (chunk) => data += chunk);
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          if (json.url) resolve(json.url); // Return the MP4 URL
          else reject(new Error("API returned no URL: " + data));
        } catch (e) {
          reject(new Error("API parse failed: " + data));
        }
      });
    });
    
    req.on("error", reject);
    req.write(payload);
    req.end();
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
        await ctx.reply("🔄 Converting animated sticker to video...");
        
        const mp4Url = await postToConvertApi(buf);
        
        await ctx.sock.sendMessage(
          ctx.jid,
          { 
            video: { url: mp4Url }, 
            mimetype: "video/mp4", 
            caption: "🎥 Original Video" 
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
      return "❌ Conversion failed: " + e.message;
    }
  }
};
