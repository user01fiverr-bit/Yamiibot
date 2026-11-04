const fs = require('fs');

if (fs.existsSync('./auth_info_baileys')) {
    fs.rmSync('./auth_info_baileys', { recursive: true, force: true });
    console.log("[yamii] Cleared old session files to prevent Bad MAC.");
}

const config = require("./config");
const registry = require("./lib/registry");
const wa = require("./lib/waManager");
const tg = require("./lib/tgBot");
const ai = require("./lib/ai");
const alerts = require("./lib/alerts");
const mod = require("./lib/moderation");
const statusStore = require("./lib/statusStore");

const STRANGERS_FILE = config.strangersFile;
function loadStrangers() { try { return JSON.parse(fs.readFileSync(STRANGERS_FILE, "utf8")); } catch { return {}; } }
function saveStrangers(d) { fs.writeFileSync(STRANGERS_FILE, JSON.stringify(d, null, 2)); }

function findOwnerByWa(number, senderJid) {
  try {
    const users = JSON.parse(fs.readFileSync(config.usersFile, "utf8"));
    // Extract just the number part from the JID if it's an LID
    const senderId = senderJid ? senderJid.split("@")[0] : null;
    
    for (const [tgId, rec] of Object.entries(users)) {
      const w = rec.whatsapps || [];
      if (w.includes(number) || (senderId && w.includes(senderId)) || (senderJid && w.includes(senderJid))) {
          return { tgId };
      }
    }
  } catch (e) { console.log("Owner check error:", e); }
  return null;
}

function extractQuoted(m) {
  const msg = m.message || {};
  const contextInfo = msg.extendedTextMessage?.contextInfo;
  if (!contextInfo || !contextInfo.quotedMessage) return { quotedRaw: null };
  return { quotedRaw: { key: { remoteJid: m.key.remoteJid, id: contextInfo.stanzaId, fromMe: false, participant: contextInfo.participant }, message: contextInfo.quotedMessage } };
}

async function onWaMessage(number, sock, m) {
  if (wa.isRecentBotMessage(m.key.id)) return;
  const jid = m.key.remoteJid || "";
  const senderJid = m.key.fromMe ? (sock.user.id.split(":")[0] + "@s.whatsapp.net") : (m.key.participant || m.key.remoteJid);

  if (jid === "status@broadcast") { /* ... keep existing status logic ... */ return; }

  const text = m.message?.conversation || m.message?.extendedTextMessage?.text || "";
  if (!text || text.startsWith("🤖") || text.startsWith("✅") || text.startsWith("⚠️") || text.startsWith("❌") || text.startsWith("🏓")) return;

  const { quotedRaw } = extractQuoted(m);
  const isReply = quotedRaw !== null;

  if (text.startsWith(config.prefix)) {
    const [raw, ...args] = text.slice(config.prefix.length).trim().split(/ +/);
    if (raw === "reload") {
      registry.load();
      return sock.sendMessage(jid, { text: `✅ Reloaded.` });
    }
    
    const cmd = registry.get(raw);
    if (!cmd) return sock.sendMessage(jid, { text: `❌ Command not found.` });

    const ownerRec = findOwnerByWa(number, senderJid);
    const ctx = {
      reply: (t) => sock.sendMessage(jid, { text: t }),
      send: (t, o) => sock.sendMessage(jid, Object.assign({ text: t }, o)),
      args, text, jid, sock, ai, config, registry, quotedRaw,
      tgId: ownerRec ? ownerRec.tgId : null, raw
    };

    try { const r = await cmd.run(ctx); if (r) await sock.sendMessage(jid, { text: r }); } catch(e) { console.error(e); }
    return;
  }

  // ... (Keep the rest of the group / stranger logic from the previous index.js) ...
}
