const fs = require("fs"); const path = require("path");
const GAMES = path.join(__dirname, "..", "games.json");
function load() { try { return JSON.parse(fs.readFileSync(GAMES, "utf8")); } catch { return {}; } }
function save(d) { fs.writeFileSync(GAMES, JSON.stringify(d, null, 2)); }
module.exports = { get: (id) => load()[id], set: (id, data) => { const d = load(); d[id] = data; save(d); }, del: (id) => { const d = load(); delete d[id]; save(d); } };
