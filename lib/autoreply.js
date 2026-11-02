const fs = require("fs");
const path = require("path");
const config = require("../config");

function loadUsers() { try { return JSON.parse(fs.readFileSync(config.usersFile, "utf8")); } catch { return {}; } }
function findOwnerByWa(waNumber) {
  const users = loadUsers();
  for (const [tgId, rec] of Object.entries(users)) {
    if ((rec.whatsapps || []).includes(waNumber)) return { tgId, rec };
  }
  return null;
}

async function handleStranger(sock, m, ownerWa) {
  try {
    const jid = m.key.remoteJid || "";
    if (jid.endsWith("@g.us") || m.key.fromMe) return;
    
    const owner = findOwnerByWa(ownerWa);
    const rec = owner?.rec || {};
    if (rec.autoreplyStrangers !== "on") return;

    const sender = jid.split("@")[0];
    if (sender === ownerWa) return;

    const msg = m.message || {};
    const text = msg.conversation || msg.extendedTextMessage?.text || "";
    if (!text) return;

    // Send AI greeting based on their text
    const botname = rec.botname || config.botName;
    const greeting = `Hi, I'm ${botname} AI. The owner is not available right now. They will see your message soon. (You said: "${text.slice(0,20)}...")`;
    
    await sock.sendMessage(jid, { text: greeting });
    console.log(`[autoreply] greeted stranger ${sender}`);
  } catch (e) { console.log(e.message); }
}

async function handleDeleted(sock, m, ownerWa) {
  // Auto-forward deleted messages to self-chat
  try {
    const proto = m.message?.protocolMessage;
    if (!proto || proto.type !== 0) return; // 0 is REVOKE
    const deletedId = proto.key?.id;
    if (!deletedId) return;
    
    const selfJid = `${ownerWa}@s.whatsapp.net`;
    await sock.sendMessage(selfJid, { text: `🗑 *Message deleted* by someone. (ID: ${deletedId.slice(0,8)})` });
    console.log(`[revoke] detected`);
  } catch (e) { console.log(e.message); }
}

module.exports = { handleStranger, handleDeleted };
