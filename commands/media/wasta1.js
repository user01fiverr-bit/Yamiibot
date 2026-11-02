const statusStore = require("../../lib/statusStore");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");

module.exports = {
  name: "wasta1",
  category: "media",
  description: "Get status number 1",
  usage: ".wasta1",
  permission: "user",
  async run(ctx) {
    let target = ctx.quotedRaw?.key?.participant || ctx.jid;
    const statuses = statusStore.getStatuses(target);
    if (!statuses.length) return "❌ No statuses found for this contact.";
    
    statuses.sort((a, b) => a.timestamp - b.timestamp);
    if (0 >= statuses.length) return `❌ This contact only has ${statuses.length} statuses.`;
    
    const status = statuses[0];
    try {
      const buf = await downloadMediaMessage({ key: status.key, message: status.message }, "buffer", {}, { logger: console, reuploadRequest: ctx.sock.updateMediaMessage });
      if (status.type === "imageMessage") await ctx.sock.sendMessage(ctx.jid, { image: buf, caption: "📸 Status" });
      else if (status.type === "videoMessage") await ctx.sock.sendMessage(ctx.jid, { video: buf, caption: "🎥 Status" });
      else if (status.type === "audioMessage") await ctx.sock.sendMessage(ctx.jid, { audio: buf, mimetype: "audio/ogg; codecs=opus", ptt: true });
      else if (status.type === "extendedTextMessage") await ctx.sock.sendMessage(ctx.jid, { text: status.message.extendedTextMessage.text });
    } catch (e) {
      return "❌ Failed to download status: " + e.message;
    }
  }
};
