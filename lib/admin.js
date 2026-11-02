const fs = require("fs"); const path = require("path");
const BANS = path.join(__dirname, "..", "bans.json");
const WARNS = path.join(__dirname, "..", "warns.json");
function load(f) { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch { return {}; } }
function save(f, d) { fs.writeFileSync(f, JSON.stringify(d, null, 2)); }
module.exports = {
  isBanned: (id) => !!load(BANS)[id],
  ban: (id, reason) => { const d = load(BANS); d[id] = reason || "No reason"; save(BANS, d); },
  unban: (id) => { const d = load(BANS); delete d[id]; save(BANS, d); },
  warn: (id, reason) => { const d = load(WARNS); if(!d[id]) d[id] = []; d[id].push(reason || "No reason"); save(WARNS, d); return d[id].length; },
  getWarns: (id) => load(WARNS)[id] || [],
  resetWarns: (id) => { const d = load(WARNS); delete d[id]; save(WARNS, d); }
};
