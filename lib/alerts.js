const config = require("../config");

async function notifyDisconnect(tgBot, number, reason) {
  if (!tgBot) return;
  const text = `⚠️ *WhatsApp Disconnected*\n━━━━━━━━━━━━━━━\nThe number \`${number}\` has been unlinked.\nReason: ${reason}\n\nYou will need to use /connect to link it again.`;
  try {
    await tgBot.sendMessage(config.ownerTgId, text, { parse_mode: "Markdown" });
  } catch (e) {
    console.log("[alert] failed to send telegram message:", e.message);
  }
}

module.exports = { notifyDisconnect };
