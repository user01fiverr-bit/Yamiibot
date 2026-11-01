const fs = require("fs");
const path = require("path");
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");
const { Boom } = require("@hapi/boom");
const pino = require("pino");
const config = require("../config");

const sockets = new Map();
const log = pino({ level: "silent" });
let disconnectHandler = null;

const recentBotMessages = new Set();
function isRecentBotMessage(id) { return recentBotMessages.has(id); }
function setDisconnectHandler(fn) { disconnectHandler = fn; }

async function startSession(number, hooks, onCode, onOpen) {
  const dir = path.join(config.sessionsDir, number);
  fs.mkdirSync(dir, { recursive: true });
  const { state, saveCreds } = await useMultiFileAuthState(dir);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version, logger: log, printQRInTerminal: false, auth: state, browser: ["Ubuntu", "Chrome", "20.0.04"],
    syncFullHistory: false, markOnlineOnConnect: false, generateHighQualityLinkPreview: false,
  });

  const originalSend = sock.sendMessage.bind(sock);
  sock.sendMessage = async (jid, content, options) => {
    const result = await originalSend(jid, content, options);
    if (result && result.key && result.key.id) {
      recentBotMessages.add(result.key.id);
      if (recentBotMessages.size > 100) recentBotMessages.delete(recentBotMessages.values().next().value);
    }
    return result;
  };

  sockets.set(number, sock);
  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (u) => {
    const { connection, lastDisconnect } = u;
    if (connection === "open") { if (onOpen) onOpen(number, sock); }
    if (connection === "close") {
      const code = new Boom(lastDisconnect?.error)?.output?.statusCode;
      if (code === DisconnectReason.loggedOut) {
        fs.rmSync(dir, { recursive: true, force: true });
        sockets.delete(number);
        if (disconnectHandler) disconnectHandler(number, "Logged out");
      } else {
        setTimeout(() => startSession(number, hooks, onCode, onOpen), 5000);
      }
    }
  });

  sock.ev.on("messages.upsert", async (payload) => {
    for (const m of payload.messages || []) {
      if (!m.message) continue;
      if (hooks?.onMessage) { try { await hooks.onMessage(number, sock, m); } catch (e) {} }
    }
  });

  if (!sock.authState.creds.registered && onCode) {
    setTimeout(async () => {
      try { const code = await sock.requestPairingCode(number); onCode(number, code); } catch (e) {}
    }, 3000);
  }
  return sock;
}

async function startAll(hooks, onCode, onOpen) {
  if (!fs.existsSync(config.sessionsDir)) return;
  for (const entry of fs.readdirSync(config.sessionsDir)) {
    const full = path.join(config.sessionsDir, entry);
    if (!fs.statSync(full).isDirectory()) continue;
    if (!fs.existsSync(path.join(full, "creds.json"))) continue;
    startSession(entry, hooks, null, onOpen).catch((e) => {});
  }
}

function get(number) { return sockets.get(number); }
function list() { return [...sockets.keys()]; }

module.exports = { startSession, startAll, get, list, setDisconnectHandler, isRecentBotMessage };
