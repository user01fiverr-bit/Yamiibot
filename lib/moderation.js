const fs = require("fs");
const path = require("path");
const FILE = path.join(__dirname, "..", "moderation.json");

function load() { try { return JSON.parse(fs.readFileSync(FILE, "utf8")); } catch { return {}; } }
function save(data) { fs.writeFileSync(FILE, JSON.stringify(data, null, 2)); }

function getGroup(id) {
  const db = load();
  if (!db[id]) {
    db[id] = { antilink: false, antisticker: false, antiimage: false, antivideo: false, antibadword: false };
    save(db);
    return db[id];
  }
  return db[id];
}
function setGroup(id, key, val) {
  const db = load();
  if (!db[id]) db[id] = {};
  db[id][key] = val;
  save(db);
}
module.exports = { getGroup, setGroup };
