const fs = require("fs");
const path = require("path");
const FILE = path.join(__dirname, "..", "afk.json");

function load() { try { return JSON.parse(fs.readFileSync(FILE, "utf8")); } catch { return {}; } }
function save(d) { fs.writeFileSync(FILE, JSON.stringify(d, null, 2)); }

function setAfk(number, status, prompt) {
  const d = load();
  d[number] = { status, prompt };
  save(d);
}
function getAfk(number) {
  const d = load();
  return d[number] || { status: false, prompt: "I am currently away. I will reply when I am back." };
}
module.exports = { setAfk, getAfk };
