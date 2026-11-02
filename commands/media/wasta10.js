const statusStore = require("../../lib/statusStore");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");

module.exports = {
  name: "wasta10",
  category: "media",
  description: "Get status number 10",
  usage: ".wasta10",
  permission: "user",
  async run(ctx) {
    let target = ctx.quotedRaw?.key?.participant || ctx.jid;
    if (ctx.args[0] && /^\d+$/.test(ctx.args[0])) target = ctx.args[0].replace(/\D/g, "") + "@s.whatsapp.net";
    
    const statuses = statusStore.getStatuses(target);
    if (!statuses.length) return "❌ No statuses found for this contact. (Statuses are only saved if the bot was running when they posted it).";
    
    statuses.sort((a, b) => a.timestamp - b.timestamp);
    if (9 >= statuses.length) return `❌ This contact only has ${statuses.length} statuses.`;
    
    const status = statuses[9];
    try {
      if (status.type === "imageMessage") {
        const buf = await downloadMediaMessage({ key: status.key, message: status.message }, "buffer", {}, { logger: console, reuploadRequest: ctx.sock.updateMediaMessage });
        await ctx.sock.sendMessage(ctx.jid, { image: buf, caption: "📸 Status" });
      } else if (status.type === "videoMessage") {
        const buf = await downloadMediaMessage({ key: status.key, message: status.message }, "buffer", {}, { logger: console, reuploadRequest: ctx.sock.updateMediaMessage });
        await ctx.sock.sendMessage(ctx.jid, { video: buf, caption: "🎥 Status" });
      } else if (status.type === "audioMessage") {
        const buf = await downloadMediaMessage({ key: status.key, message: status.message }, "buffer", {}, { logger: console, reuploadRequest: ctx.sock.updateMediaMessage });
        await ctx.sock.sendMessage(ctx.jid, { audio: buf, mimetype: "audio/ogg; codecs=opus", ptt: true });
      } else if (status.type === "extendedTextMessage") {
        await ctx.sock.sendMessage(ctx.jid, { text: status.message.extendedTextMessage.text });
      } else {
        return "❌ Unsupported status type.";
      }
    } catch (e) {
      return "❌ Failed to download status: " + e.message;
    }
  }
};
