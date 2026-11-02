const _tg = require("node-telegram-bot-api");
const TelegramBot = _tg.TelegramBot || _tg.default || _tg;
const fs = require("fs");
const path = require("path");
const config = require("../config");
const registry = require("./registry");
const ai = require("./ai");
const wa = require("./waManager");
const welcome = require("./welcome");

const VERIFIED_FILE = path.join(__dirname, "..", "verified.json");
const LANG_FILE = path.join(__dirname, "..", "langs.json");

function getVerified() { try { return JSON.parse(fs.readFileSync(VERIFIED_FILE, "utf8")); } catch { return {}; } }
function saveVerified(data) { fs.writeFileSync(VERIFIED_FILE, JSON.stringify(data, null, 2)); }
function isVerified(tgId) { return !!getVerified()[String(tgId)]; }
function markVerified(tgId) { const v = getVerified(); v[String(tgId)] = true; saveVerified(v); }

function getLangs() { try { return JSON.parse(fs.readFileSync(LANG_FILE, "utf8")); } catch { return {}; } }
function saveLang(tgId, lang) { const l = getLangs(); l[String(tgId)] = lang; fs.writeFileSync(LANG_FILE, JSON.stringify(l, null, 2)); }
function getUserLang(tgId) { return getLangs()[String(tgId)] || "en"; }

let bot = null;
const pending = new Map();
let HOOKS = null;
function setHooks(h) { HOOKS = h; }

function loadUsers() { try { return JSON.parse(fs.readFileSync(config.usersFile, "utf8")); } catch { return {}; } }
function saveUsers(u) { fs.writeFileSync(config.usersFile, JSON.stringify(u, null, 2)); }
function isSuperOwner(chatId) { return String(chatId) === String(config.ownerTgId); }

function formatUptime() {
  let sec = process.uptime();
  let d = Math.floor(sec / (3600*24)); sec -= d*3600*24;
  let h = Math.floor(sec / 3600); sec -= h*3600;
  let m = Math.floor(sec / 60); sec = Math.floor(sec % 60);
  return `${d > 0 ? d + "d " : ""}${h}h ${m}m`;
}

const TEXTS = {
  en: { title: "SYSTEM", status: "STATUS", sessions: "SESSIONS", memory: "MEMORY", uptime: "UPTIME", commands: "COMMANDS", btnCmd: "Commands", btnSession: "My Session", btnDisc: "Disconnect", btnPing: "Ping", btnUp: "Uptime", btnId: "My ID", btnLang: "Language", btnHome: "🏠 Home", btnAgain: "🔄 Again", btnLink: "🔗 Connect", connect: "🔗 *LINK YOUR WHATSAPP*\n━━━━━━━━━━━━━━━━━━\nSend your phone number below with the country code.\n\n📝 *Format:* 2348012345678" }
};
function getT(lang) { return TEXTS[lang] || TEXTS.en; }

function getDashboardText(t) {
  const mem = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);
  const uptime = formatUptime();
  const commands = registry.count();
  const categories = registry.categories().length;
  const sessionsCount = Object.keys(loadUsers()).length;
  
  return (
`🕷️ *YAMII AI MD* v7.0
_AI • MEDIA • TOOLS_

╭━━━━━━━━━━━━━━━━━━╮
┃ 🕸️ *${t.title}*
┃ 🌟 ${t.status} ➔ 🟢 online
┃ 📁 ${t.sessions} ➔ ${sessionsCount} / 1000
┃ 💾 ${t.memory} ➔ ${mem} MB
┃ ⏱️ ${t.uptime} ➔ ${uptime}
╰━━━━━━━━━━━━━━━━━━╯

╭━━━━━━━━━━━━━━━━━━╮
┃ 💀 *${t.commands}*
┃ 📜 ${commands} documented • ${categories} categories
╰━━━━━━━━━━━━━━━━━━╯

— ◆ *YAMII AI MD • v7.0* ◆ —`
  );
}

function getDashboardButtons(t) {
  return {
    inline_keyboard: [
      [{ text: `📜 ${t.btnCmd}`, callback_data: "menu_help" }],
      [{ text: `👤 ${t.btnSession}`, callback_data: "menu_status" }, { text: `🗑️ ${t.btnDisc}`, callback_data: "menu_disconnect" }],
      [{ text: `📱 Saved Numbers`, callback_data: "menu_saved" }, { text: `🔗 Connect`, callback_data: "menu_connect" }],
      [{ text: `⚡ ${t.btnPing}`, callback_data: "menu_ping" }, { text: `⏱️ ${t.btnUp}`, callback_data: "menu_uptime" }, { text: `🆔 ${t.btnId}`, callback_data: "menu_id" }],
      [{ text: `🌐 ${t.btnLang}`, callback_data: "menu_main" }]
    ]
  };
}

function getGateText(firstName) {
  return (
`🔒 *YAMII AI* ◄ v7.0 ► 🔒
⛩️ *THE GATE OF THE VILLAGE*
━━━━━━━━━━━━━━━━━━

Hey *${firstName}* 👋
▸ One moment, shinobi. The gate is earned.
Join the official channel and group,
then tap ✅ *I've Joined to open the door.*

❖ *REQUIRED*
🔴 📣 [Yamii TikTok](https://tiktok.com/@omohyamii)
🔴 📣 [Yamii WhatsApp Channel](https://whatsapp.com/channel/0029VbDRdya7z4khjG8GJb1o)
🔴 👥 [Yamii Group](https://chat.whatsapp.com/HgLiZAn1VACC9sfoxWoYtv?s=cl&p=a&iam=2)

━━━━━━━━━━━━━━━━━━
╭「 *WILL OF FIRE* 」╮
╰──➤ Dev: *Yamii Tech* ♦ v7.0 ──╯`
  );
}

async function start() {
  bot = new TelegramBot(config.tgToken, { polling: true });
  console.log("[tg] polling");

  const sendDashboard = async (chatId) => {
    const lang = getUserLang(chatId);
    const t = getT(lang);
    bot.sendMessage(chatId, getDashboardText(t), { parse_mode: "Markdown", reply_markup: getDashboardButtons(t) });
  };

  bot.onText(/^\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const name = msg.from.first_name || "shinobi";
    const coverImage = "https://i.postimg.cc/7Lpp94kx/file-0000000025408210953f00243af674c4.png";
    const lang = getUserLang(chatId);
    const t = getT(lang);

    const rec = loadUsers()[String(chatId)];
    if (rec && rec.suspended) return bot.sendMessage(chatId, `⛔ *Account Suspended*`);

    if (!isVerified(chatId) || isSuperOwner(chatId)) {
      const gateOpts = { parse_mode: "Markdown", reply_markup: { inline_keyboard: [[{ text: "📣 1. Follow TikTok", url: "https://tiktok.com/@omohyamii" }],[{ text: "📣 2. Join WhatsApp Channel", url: "https://whatsapp.com/channel/0029VbDRdya7z4khjG8GJb1o" }],[{ text: "👥 3. Join WhatsApp Group", url: "https://chat.whatsapp.com/HgLiZAn1VACC9sfoxWoYtv?s=cl&p=a&iam=2" }],[{ text: "✅ I Have Completed All 3 Steps", callback_data: "verify" }]] } };
      try { await bot.sendPhoto(chatId, coverImage, { caption: getGateText(name), ...gateOpts }); } catch { await bot.sendMessage(chatId, getGateText(name), gateOpts); }
    } else {
      await sendDashboard(chatId);
    }
  });

  bot.onText(/^\/menu/, async (msg) => {
    await sendDashboard(msg.chat.id);
  });

  bot.onText(/^\/help/, async (msg) => {
    try {
      const cats = registry.categories();
      let text = `📜 *COMMAND CATEGORIES*\n━━━━━━━━━━━━━━━━━━\n`;
      for (const c of cats) text += `▸ *${c.toUpperCase()}* (${registry.inCategory(c).length})\n`;
      text += `\n💡 *How to use:* Link WhatsApp via /connect, then type commands in WhatsApp (e.g., \`.menu\`).`;
      bot.sendMessage(msg.chat.id, text, { parse_mode: "Markdown" });
    } catch(e) { bot.sendMessage(msg.chat.id, `❌ Error: ${e.message}`); }
  });

  bot.on("callback_query", async (q) => {
    const chatId = q.message.chat.id;
    const name = q.from.first_name || "shinobi";
    const currentLang = getUserLang(chatId);
    const t = getT(currentLang);

    if (q.data === "verify") {
      markVerified(chatId);
      bot.answerCallbackQuery(q.id, { text: "Access Granted." });
      const opts = { parse_mode: "Markdown", reply_markup: { inline_keyboard: [[{ text: "🔗 Link WhatsApp ❖", callback_data: "menu_connect" }],[{ text: "🏠 Main Menu", callback_data: "menu_start" }]] } };
      try { await bot.sendPhoto(chatId, "https://i.postimg.cc/7Lpp94kx/file-0000000025408210953f00243af674c4.png", { caption: "✦ *ACCESS GRANTED* ✦", ...opts }); } catch { await bot.sendMessage(chatId, "✦ *ACCESS GRANTED* ✦", opts); }
    }

    if (q.data === "menu_start") {
      bot.answerCallbackQuery(q.id);
      await sendDashboard(chatId);
    }

    if (q.data === "menu_saved") {
      bot.answerCallbackQuery(q.id);
      const rec = loadUsers()[String(chatId)];
      if (!rec || !(rec.whatsapps || []).length) {
        return bot.sendMessage(chatId, "⚠️ You have no saved numbers. Use the Connect button to add a new one.");
      }
      const buttons = rec.whatsapps.map(n => [{ text: `📱 ${n}`, callback_data: `reconnect_${n}` }]);
      buttons.push([{ text: "➕ Add New Number", callback_data: "menu_connect" }]);
      buttons.push([{ text: t.btnHome, callback_data: "menu_start" }]);
      bot.sendMessage(chatId, "👇 *Select a saved number to reconnect:*", { parse_mode: "Markdown", reply_markup: { inline_keyboard: buttons } });
    }

    if (q.data.startsWith("reconnect_")) {
      const number = q.data.split("_")[1];
      bot.answerCallbackQuery(q.id, { text: `Generating code for ${number}...` });
      bot.sendMessage(chatId, `🔄 Reconnecting \`${number}\`...\nGenerating pairing code.`, { parse_mode: "Markdown" });
      pair(chatId, number);
    }

    if (q.data === "menu_help") {
      bot.answerCallbackQuery(q.id);
      const cats = registry.categories();
      const emojis = { general: "⚙️", economy: "💎", games: "⚡", tools: "🛠️", audio: "🎵", reactions: "✨", textmaker: "✨", anime: "🕷️", media: "🎨", search: "🔍", ai: "🧠", group: "👥", moderation: "⚫", osint: "💀", owner: "👑", download: "📥", text: "✍️" };
      const buttons = []; let row = [];
      for (const cat of cats) {
        row.push({ text: `${emojis[cat.toLowerCase()] || "📌"} ${cat.charAt(0).toUpperCase() + cat.slice(1)}`, callback_data: `cat_${cat.toLowerCase()}` });
        if (row.length === 2) { buttons.push(row); row = []; }
      }
      if (row.length > 0) buttons.push(row);
      buttons.push([{ text: t.btnHome, callback_data: "menu_start" }]);
      bot.sendMessage(chatId, `📚 *COMMANDS* ${registry.count()}\n_${cats.length} categories_\n\n👇 _Select a category below:_`, { parse_mode: "Markdown", reply_markup: { inline_keyboard: buttons } });
    }

    if (q.data.startsWith("cat_")) {
      const cat = q.data.split("_")[1];
      const cmds = registry.inCategory(cat);
      if (!cmds.length) return bot.answerCallbackQuery(q.id, { text: "No commands here yet." });
      bot.answerCallbackQuery(q.id);
      const blockquote = cmds.map(c => `> \`.${c.name}\` ⇔ ${c.description || "no description"}`).join("\n");
      bot.sendMessage(chatId, `📌 *${cat.toUpperCase()}*\n_${cmds.length} commands_\n\n${blockquote}`, { parse_mode: "Markdown", reply_markup: { inline_keyboard: [[{ text: "📚 Categories", callback_data: "menu_help" }]] } });
    }

    if (q.data === "menu_disconnect") {
      bot.answerCallbackQuery(q.id);
      const rec = loadUsers()[String(chatId)];
      if (!rec || !(rec.whatsapps || []).length) return bot.sendMessage(chatId, "⚠️ No numbers linked.", { parse_mode: "Markdown" });
      const buttons = rec.whatsapps.map(n => [{ text: `🗑 ${n}`, callback_data: `disc_${n}` }]);
      buttons.push([{ text: t.btnHome, callback_data: "menu_start" }]);
      bot.sendMessage(chatId, "👇 *Select the number you want to disconnect:*", { parse_mode: "Markdown", reply_markup: { inline_keyboard: buttons } });
    }

    if (q.data.startsWith("disc_")) {
      const number = q.data.split("_")[1];
      bot.answerCallbackQuery(q.id, { text: `Disconnecting ${number}...` });
      const users = loadUsers();
      const rec = users[String(chatId)];
      if (rec && (rec.whatsapps || []).includes(number)) {
        rec.whatsapps = rec.whatsapps.filter(n => n !== number);
        users[String(chatId)] = rec; saveUsers(users);
      }
      const sock = wa.get(number);
      if (sock) { try { await sock.logout(); } catch(e) {} }
      try { wa.list().splice(wa.list().indexOf(number), 1); } catch(e) {}
      try { fs.rmSync(path.join(config.sessionsDir, number), { recursive: true, force: true }); } catch(e) {}
      bot.sendMessage(chatId, `✅ Successfully disconnected \`${number}\`.`, { parse_mode: "Markdown" });
      setTimeout(() => { sendDashboard(chatId); }, 1000);
    }

    if (q.data === "menu_status") {
      bot.answerCallbackQuery(q.id);
      const rec = loadUsers()[String(chatId)];
      const isConnected = rec && (rec.whatsapps || []).some(n => wa.get(n));
      const num = rec && (rec.whatsapps || []).length ? rec.whatsapps[0] : null;
      const text = `🕷️ *MY SESSION*\n━━━━━━━━━━━━━━━━━━\n> 🔴 *CONNECTION* ➔ ${isConnected ? "Connected" : "Not connected"}\n> 📟 *NUMBER* ➔ ${num ? "`" + num + "`" : "—"}\n> ⚡ *UPTIME* ➔ ${formatUptime()}\n━━━━━━━━━━━━━━━━━━`;
      bot.sendMessage(chatId, text, { parse_mode: "Markdown", reply_markup: { inline_keyboard: [[{ text: t.btnLink, callback_data: "menu_connect" }], [{ text: t.btnHome, callback_data: "menu_start" }]] } });
    }

    if (q.data === "menu_uptime") {
      bot.answerCallbackQuery(q.id);
      const text = `🕷️ *UPTIME*\n━━━━━━━━━━━━━━━━━━\n> 🏃 *RUNNING* ➔ ${formatUptime()}\n> 📁 *SESSIONS* ➔ ${Object.keys(loadUsers()).length}\n━━━━━━━━━━━━━━━━━━`;
      bot.sendMessage(chatId, text, { parse_mode: "Markdown", reply_markup: { inline_keyboard: [[{ text: t.btnAgain, callback_data: "menu_uptime" }, { text: t.btnHome, callback_data: "menu_start" }]] } });
    }

    if (q.data === "menu_id") {
      bot.answerCallbackQuery(q.id);
      const text = `🕷️ *YOUR IDENTITY*\n━━━━━━━━━━━━━━━━━━\n> 👤 *NAME* ➔ ${name}\n> 🆔 *ID* ➔ ${chatId}\n━━━━━━━━━━━━━━━━━━`;
      bot.sendMessage(chatId, text, { parse_mode: "Markdown", reply_markup: { inline_keyboard: [[{ text: t.btnAgain, callback_data: "menu_id" }, { text: t.btnHome, callback_data: "menu_start" }]] } });
    }

    if (q.data === "menu_connect") {
      bot.answerCallbackQuery(q.id);
      pending.set(chatId, true);
      bot.sendMessage(chatId, t.connect, { parse_mode: "Markdown" });
    }

    if (q.data === "menu_main") {
      bot.answerCallbackQuery(q.id);
      const menuOpts = { parse_mode: "Markdown", reply_markup: { inline_keyboard: [[{ text: "🇬🇧 English", callback_data: "lang_en" }, { text: "🇫🇷 Français", callback_data: "lang_fr" }],[{ text: "🇵🇹 Português", callback_data: "lang_pt" }, { text: "🇪🇸 Español", callback_data: "lang_es" }],[{ text: "🇨🇳 中文", callback_data: "lang_zh" }, { text: "🇯🇵 日本語", callback_data: "lang_ja" }],[{ text: "🇳🇬 Yorùbá", callback_data: "lang_yo" }, { text: "🇷🇺 Русский", callback_data: "lang_ru" }]] } };
      try { await bot.sendPhoto(chatId, "https://i.postimg.cc/7Lpp94kx/file-0000000025408210953f00243af674c4.png", { caption: "🌐 *Which language do you use?*", ...menuOpts }); } catch { await bot.sendMessage(chatId, "🌐 *Which language do you use?*", menuOpts); }
    }

    if (q.data.startsWith("lang_")) {
      const newLang = q.data.split("_")[1];
      saveLang(chatId, newLang);
      bot.answerCallbackQuery(q.id, { text: `Language changed.` });
      await sendDashboard(chatId);
    }

    if (q.data === "menu_ping") bot.answerCallbackQuery(q.id, { text: `Pong! ${Date.now() % 1000}ms` });
  });

  bot.onText(/^\/connect/, async (msg) => {
    pending.set(msg.chat.id, true);
    const lang = getUserLang(msg.chat.id);
    const t = getT(lang);
    bot.sendMessage(msg.chat.id, t.connect, { parse_mode: "Markdown" });
  });

  bot.on("message", async (msg) => {
    try {
      const chatId = msg.chat.id; const text = msg.text || msg.caption || "";
      if (!text || text.startsWith("/")) return;
      if (pending.get(chatId) && /^\d{8,15}$/.test(text)) { pending.delete(chatId); return pair(chatId, text); }
      
      if (text.startsWith(config.prefix)) {
        const [raw, ...args] = text.slice(config.prefix.length).split(/\s+/);
        
        if (raw === "reload") {
          registry.load();
          return bot.sendMessage(chatId, `✅ Reloaded. ${registry.count()} commands active.`);
        }

        const cmd = registry.get(raw);
        
        if (cmd) {
          const ctx = { reply: (t) => bot.sendMessage(chatId, t, { parse_mode: "Markdown" }), send: (t, o) => bot.sendMessage(chatId, t, o || {}), args, text, ai, config, registry, wa, from: "telegram", tgId: chatId };
          const r = await cmd.run(ctx); 
          if (r) bot.sendMessage(chatId, r, { parse_mode: "Markdown" }); 
          return;
        } else {
          return bot.sendMessage(chatId, `❌ Command \`.${raw}\` does not exist.\nType \`/help\` to see all available commands.`, { parse_mode: "Markdown" });
        }
      }
      
      if (text.trim()) bot.sendMessage(chatId, `🧠 ${await ai.ask(text)}`, { parse_mode: "Markdown" });
    } catch (e) { 
      console.log("[msg]", e.message); 
      bot.sendMessage(msg.chat.id, `❌ Error running command: ${e.message}`); 
    }
  });
}

async function pair(chatId, number) {
  number = String(number).replace(/\D/g, "");
  bot.sendMessage(chatId, `⚡ *Generating Pairing Code...*`, { parse_mode: "Markdown" });
  try {
    await wa.startSession(number, HOOKS,
      (n, code) => bot.sendMessage(chatId, `🔗 *YOUR PAIRING CODE*\n━━━━━━━━━━━━━━━━━━\n\n\`${code}\`\n\nEnter this in WhatsApp -> Linked Devices.`, { parse_mode: "Markdown" }),
      async (n, sock) => {
        bot.sendMessage(chatId, `✅ *WhatsApp Connected Successfully!*`, { parse_mode: "Markdown" });
        const users = loadUsers(); const key = String(chatId);
        const list = users[key]?.whatsapps || [];
        if (!list.includes(n)) list.push(n);
        users[key] = { ...users[key], whatsapps: list, botname: "Yamii", autoreplyStrangers: "on" };
        saveUsers(users);
        setTimeout(async () => { try { await welcome.sendWelcomeCard(sock, n, "Yamii", config.prefix); } catch {} }, 2000);
      });
  } catch (e) { bot.sendMessage(chatId, `❌ *Failed:* ${e.message}`); }
}

module.exports = { start, setHooks, bot: () => bot };
