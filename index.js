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

async function onWaMessage(number, sock, m) {
  console.log("[DEBUG] Received message from:", m.key.remoteJid, "fromMe:", m.key.fromMe);
  
  const text = m.message?.conversation || m.message?.extendedTextMessage?.text || "";
  if (!text) return;
  
  console.log("[DEBUG] Text:", text);
  
  if (text === ".ping") {
     await sock.sendMessage(m.key.remoteJid, { text: "🏓 PONG! (Debug Mode)" }, { quoted: m });
     return;
  }

  if (text === ".reload") {
     registry.load();
     await sock.sendMessage(m.key.remoteJid, { text: `✅ Reloaded.` }, { quoted: m });
     return;
  }
}

const HOOKS = { onMessage: onWaMessage };

(async () => {
  console.log("[yamii] booting");
  registry.load();
  tg.setHooks(HOOKS);
  
  await wa.startAll(HOOKS, null, (n) => console.log("[wa]", n, "ready"));
  await tg.start();
  console.log("[yamii] online");
})();
