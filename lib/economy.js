const fs = require("fs");
const path = require("path");

const DB_FILE = path.join(__dirname, "..", "economy.json");

function loadDB() {
  try { return JSON.parse(fs.readFileSync(DB_FILE, "utf8")); } catch { return {}; }
}
function saveDB(data) { fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2)); }

function getUser(id) {
  const db = loadDB();
  if (!db[id]) {
    db[id] = { wallet: 500, bank: 0, inventory: [], lastDaily: 0, lastWork: 0 };
    saveDB(db);
    return db[id];
  }
  return db[id];
}
function saveUser(id, data) {
  const db = loadDB();
  db[id] = data;
  saveDB(db);
}

module.exports = { getUser, saveUser };
