const fs = require("fs");
const config = require("../config");

function loadStrangers() { try { return JSON.parse(fs.readFileSync(config.strangersFile, "utf8")); } catch { return {}; } }
function saveStrangers(d) { fs.writeFileSync(config.strangersFile, JSON.stringify(d, null, 2)); }

async function handleStranger(sock, m, ownerWa) {
  const jid = m.key.remoteJid || "";
  if (jid.endsWith("@g.us") || m.key.fromMe) return;
  const strangers = loadStrangers();
  if (!strangers[jid]) {
    const msg = `🤖 *Yamii AI*\n\nHello! The owner is away. Reply to this message to chat with me.`;
    await sock.sendMessage(jid, { text: msg });
    strangers[jid] = { greeted: true };
    saveStrangers(strangers);
  }
}
module.exports = { handleStranger };
