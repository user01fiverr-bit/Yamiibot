const wa = require("../../lib/waManager");
module.exports = {
  name: "reconnect",
  category: "owner",
  description: "Force reconnect the WhatsApp socket",
  usage: ".reconnect",
  permission: "user",
  async run(ctx) {
    await ctx.reply("🔄 Forcing WhatsApp reconnection...");
    try {
      const sock = wa.get(ctx.ownerWa);
      if (sock) {
        sock.ev.removeAllListeners("connection.update");
        sock.end(undefined);
      }
      setTimeout(() => {
        wa.startSession(ctx.ownerWa, null, null, null);
      }, 2000);
      return "✅ Reconnecting. Please wait 10 seconds.";
    } catch (e) {
      return "❌ Failed: " + e.message;
    }
  }
};
