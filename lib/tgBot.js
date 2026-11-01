const _tg = require("node-telegram-bot-api");
const TelegramBot = _tg.TelegramBot || _tg.default || _tg;
const fs = require("fs");
const path = require("path");
const config = require("../config");
const registry = require("./registry");
const ai = require("./ai");
const wa = require("./waManager");

let bot = null;
const pending = new Map();
let HOOKS = null;
function setHooks(h) { HOOKS = h; }
function loadUsers() { try { return JSON.parse(fs.readFileSync(config.usersFile, "utf8")); } catch { return {}; } }
function saveUsers(u) { fs.writeFileSync(config.usersFile, JSON.stringify(u, null, 2)); }

async function start() {
  bot = new TelegramBot(config.tgToken, { polling: true });
  
  bot.onText(/^\/start/, async (msg) => {
    bot.sendMessage(msg.chat.id, `✨ *${config.botName}* is online!`, { parse_mode: "Markdown" });
  });

  bot.onText(/^\/connect/, async (msg) => {
    pending.set(msg.chat.id, true);
    bot.sendMessage(msg.chat.id, "Send your WhatsApp number with country code:");
  });

  bot.on("message", async (msg) => {
    const chatId = msg.chat.id; const text = msg.text || "";
    if (!text || text.startsWith("/")) return;
    
    if (pending.get(chatId) && /^\d{8,15}$/.test(text)) { 
        pending.delete(chatId); 
        return pair(chatId, text); 
    }
    
    if (text.startsWith(config.prefix)) {
      const [raw, ...args] = text.slice(config.prefix.length).split(/\s+/);
      if (raw === "reload") { registry.load(); return bot.sendMessage(chatId, `✅ Reloaded. ${registry.count()} commands active.`); }
      const cmd = registry.get(raw);
      if (cmd) {
        const ctx = { reply: (t) => bot.sendMessage(chatId, t, { parse_mode: "Markdown" }), args, text, ai, config, registry, wa, tgId: chatId };
        const r = await cmd.run(ctx); if (r) bot.sendMessage(chatId, r); return;
      }
    }
    if (text.trim()) bot.sendMessage(chatId, `🧠 ${await ai.ask(text)}`);
  });
}

async function pair(chatId, number) {
  bot.sendMessage(chatId, "⚡ Generating code...");
  await wa.startSession(number, HOOKS, 
    (n, code) => bot.sendMessage(chatId, `🔗 Code: \`${code}\``, { parse_mode: "Markdown" }),
    (n) => bot.sendMessage(chatId, `✅ Connected ${n}`)
  );
}
module.exports = { start, setHooks, bot: () => bot };
