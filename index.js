const fs = require("fs");
const config = require("./config");
const registry = require("./lib/registry");
const wa = require("./lib/waManager");
const tg = require("./lib/tgBot");
const ai = require("./lib/ai");
const alerts = require("./lib/alerts");
const mod = require("./lib/moderation");

const STRANGERS_FILE = config.strangersFile;
function loadStrangers() { try { return JSON.parse(fs.readFileSync(STRANGERS_FILE, "utf8")); } catch { return {}; } }
function saveStrangers(d) { fs.writeFileSync(STRANGERS_FILE, JSON.stringify(d, null, 2)); }

function findOwnerByWa(waNumber) {
  const users = JSON.parse(fs.readFileSync(config.usersFile, "utf8"));
  for (const [tgId, rec] of Object.entries(users)) {
    if ((rec.whatsapps || []).includes(waNumber)) return { tgId, rec };
  }
  return null;
}

function extractQuoted(m) {
  const msg = m.message || {};
  const contextInfo = msg.extendedTextMessage?.contextInfo || msg.imageMessage?.contextInfo || msg.videoMessage?.contextInfo;
  if (!contextInfo || !contextInfo.quotedMessage) return { quotedRaw: null };
  return { quotedRaw: { key: { remoteJid: m.key.remoteJid, fromMe: true, id: contextInfo.stanzaId, participant: contextInfo.participant }, message: contextInfo.quotedMessage } };
}

async function onWaMessage(number, sock, m) {
  if (wa.isRecentBotMessage(m.key.id)) return;

  const jid = m.key.remoteJid || "";
  const text = (m.message?.conversation || m.message?.extendedTextMessage?.text || "").trim();
  if (!text || text.startsWith("🤖") || text.startsWith("🧠")) return;

  const { quotedRaw } = extractQuoted(m);
  const isReply = quotedRaw !== null;

  // 1. COMMANDS
  if (text.startsWith(config.prefix)) {
    if (jid.endsWith("@g.us") && !m.key.fromMe) return;
    const [raw, ...args] = text.slice(config.prefix.length).split(/\s+/);
    if (raw === "reload") {
      registry.load();
      return sock.sendMessage(jid, { text: `✅ Reloaded. ${registry.count()} commands active.` });
    }
    const cmd = registry.get(raw);
    if (!cmd) {
      return sock.sendMessage(jid, { text: `❌ Command \`.${raw}\` does not exist.\nType \`.menu\` to see all available commands.` }, { quoted: m });
    }
    const ownerRec = findOwnerByWa(number);
    const ctx = {
      reply: (t) => sock.sendMessage(jid, { text: t }, { quoted: m }),
      send: (t, o) => sock.sendMessage(jid, Object.assign({ text: t }, o || {})),
      args, text, jid, sock, ai, config, registry, ownerWa: number, 
      tgId: ownerRec ? ownerRec.tgId : null, rec: ownerRec ? ownerRec.rec : null, quotedRaw
    };
    try { const r = await cmd.run(ctx); if (r) await ctx.reply(r); } catch (e) { await ctx.reply("❌ error: " + e.message); }
    return;
  }

  // 2. GROUP CHAT AI
  if (jid.endsWith("@g.us")) {
    await mod.checkModeration(sock, m, jid);
    if (isReply) {
      const systemPrompt = "You are Yamii AI in a group chat. Answer the user naturally and briefly.";
      try { const aiResponse = await ai.ask(text, systemPrompt); await sock.sendMessage(jid, { text: aiResponse }, { quoted: m }); } catch(e) {}
    }
    return;
  }

  // 3. DIRECT MESSAGES
  if (!m.key.fromMe) {
    if (!isReply) {
      const strangers = loadStrangers();
      if (!strangers[jid]) {
        const welcomeMsg = `🤖 *Yamii AI Assistant*\n\nHello! The owner is currently away and will chat you when they are around.\n\n💡 *If you want to chat with me, simply swipe and REPLY to this exact message.*`;
        await sock.sendMessage(jid, { text: welcomeMsg });
        strangers[jid] = { greeted: true, date: Date.now() };
        saveStrangers(strangers);
      }
      return; 
    }
    const systemPrompt = `You are the highly capable personal AI assistant for the owner. Introduce yourself professionally. Be polite, helpful, and concise.`;
    try { const aiResponse = await ai.ask(text, systemPrompt); await sock.sendMessage(jid, { text: aiResponse }, { quoted: m }); } catch(e) {}
    return;
  }

  // 4. OWNER AI CHAT
  if (isReply) {
    const systemPrompt = "You are Yamii AI. The owner is replying to your previous message. Answer them naturally.";
    try { const aiResponse = await ai.ask(text, systemPrompt); await sock.sendMessage(jid, { text: aiResponse }, { quoted: m }); } catch (e) {}
    return;
  }
}

async function onGroupsUpsert(number, sock, groups) {
  for (const group of groups) {
    const greeting = `🤖 *Hello guys!*\n\nI am Yamii AI, the personal assistant to the owner. How are you doing?\n\n💡 *If you want to chat with me, just reply to this message.*`;
    try { await sock.sendMessage(group.id, { text: greeting }); } catch (e) {}
  }
}

const HOOKS = { onMessage: onWaMessage, onGroupsUpsert: onGroupsUpsert };

(async () => {
  console.log("[yamii] booting");
  registry.load();
  console.log("[yamii] commands loaded:", registry.count());
  tg.setHooks(HOOKS);
  wa.setDisconnectHandler(async (number, reason) => {
    setTimeout(async () => { await alerts.notifyDisconnect(tg.bot(), number, reason); }, 2000);
  });
  await wa.startAll(HOOKS, null, (n) => console.log(`[wa] ${n} ready`));
  await tg.start();
  console.log("[yamii] online");
})();
