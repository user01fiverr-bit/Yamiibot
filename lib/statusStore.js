const fs = require("fs");
const path = require("path");
const FILE = path.join(__dirname, "..", "statuses.json");

function load() { try { return JSON.parse(fs.readFileSync(FILE, "utf8")); } catch { return {}; } }
function save(d) { fs.writeFileSync(FILE, JSON.stringify(d, null, 2)); }

function addStatus(jid, type, key, message, timestamp) {
  const d = load();
  if (!d[jid]) d[jid] = [];
  if (d[jid].some(s => s.key.id === key.id)) return; // Don't save duplicates
  d[jid].push({ type, key, message, timestamp });
  // Keep only last 24 hours of statuses
  const now = Math.floor(Date.now() / 1000);
  d[jid] = d[jid].filter(s => now - s.timestamp < 86400);
  save(d);
}

function getStatuses(jid) {
  const d = load();
  return d[jid] || [];
}

module.exports = { addStatus, getStatuses };
