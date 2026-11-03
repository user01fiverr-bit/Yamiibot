const fs = require('fs');

// Auto-purge session to prevent Bad MAC
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

function findOwnerByWa(waNumber) {
  try {
    const users = JSON.parse(fs.readFileSync(config.usersFile, "utf8"));
    for (const [tgId, rec] of Object.entries(users)) {
      if ((rec.whatsapps || []).includes(waNumber)) return { tgId };
    }
  } catch {}
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

  // CAPTURE STATUSES CORRECTLY
  if (jid === "status@broadcast") {
    if (!m.key.fromMe) {
      const sender = m.key.participant;
      const inner = m.message?.viewOnceMessageV2?.message || m.message?.viewOnceMessage?.message || m.message;
      const type = Object.keys(inner).find(k => k.endsWith("Message"));
      if (type) {
        statusStore.addStatus(sender, type, m.key.id);
      }
    }
    return;
  }

  const text = m.message?.conversation || m.message?.extendedTextMessage?.text || "";
  if (!text || text.startsWith("🤖") || text.startsWith("✅") || text.startsWith("⚠️") || text.startsWith("❌")) return;

  const { quotedRaw } = extractQuoted(m);
  const isReply = quotedRaw !== null;

  if (text.startsWith(config.prefix)) {
    const [raw, ...args] = text.slice(config.prefix.length).trim().split(/ +/);
    if (raw === "reload") {
      registry.load();
      return sock.sendMessage(jid, { text: `✅ Reloaded. ${registry.getAll().size} commands active.` });
    }
    
    const cmd = registry.get(raw);
    if (!cmd) {
      return sock.sendMessage(jid, { text: `❌ Command not found.` });
    }

    const ownerRec = findOwnerByWa(number);
    const ctx = {
      reply: (t) => sock.sendMessage(jid, { text: t }),
      send: (t, o) => sock.sendMessage(jid, Object.assign({ text: t }, o)),
      args, text, jid, sock, ai, config, registry, quotedRaw,
      tgId: ownerRec ? ownerRec.tgId : null, raw
    };

    try { const r = await cmd.run(ctx); if (r) await sock.sendMessage(jid, { text: r }); } catch(e) { console.error(e); }
    return;
  }

  if (jid.endsWith("@g.us")) {
    await mod.checkModeration(sock, m, jid);
    if (isReply) {
      const systemPrompt = "You are Yamii AI in a WhatsApp group. Reply briefly.";
      try { const aiResponse = await ai.ask(text, systemPrompt); await sock.sendMessage(jid, { text: aiResponse }, { quoted: m }); } catch {}
    }
    return;
  }

  if (!m.key.fromMe) {
    if (!isReply) {
      const strangers = loadStrangers();
      if (!strangers[jid]) {
        const welcomeMsg = `👋 *Yamii AI Assistant* \n\nI am a bot. Only my owner can use commands.`;
        await sock.sendMessage(jid, { text: welcomeMsg });
        strangers[jid] = { greeted: true, date: Date.now() };
        saveStrangers(strangers);
      }
      return;
    }
    const systemPrompt = `You are the personal AI assistant of the owner.`;
    try { const aiResponse = await ai.ask(text, systemPrompt); await sock.sendMessage(jid, { text: aiResponse }, { quoted: m }); } catch {}
    return;
  }

  if (isReply) {
    const systemPrompt = "You are Yamii AI.";
    try { const aiResponse = await ai.ask(text, systemPrompt); await sock.sendMessage(jid, { text: aiResponse }, { quoted: m }); } catch {}
  }
}

async function onGroupsUpsert(number, sock, groups) {
  for (const group of groups) {
    const greeting = `👋 *Hello guys!*\n\nI am Yamii AI.`;
    try { await sock.sendMessage(group.id, { text: greeting }); } catch {}
  }
}

const HOOKS = { onMessage: onWaMessage, onGroupsUpsert };

(async () => {
  console.log("[yamii] booting");
  registry.load();
  console.log("[yamii] commands loaded:", registry.getAll().size);
  tg.setHooks(HOOKS);
  wa.setDisconnectHandler(async (number, reason) => {
    setTimeout(async () => { await alerts.notify(reason); }, 5000);
  });
  await wa.startAll(HOOKS, null, (n) => console.log("[wa]", n, "ready"));
  await tg.start();
  console.log("[yamii] online");
})();
