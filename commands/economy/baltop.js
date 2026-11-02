const fs = require("fs"); const path = require("path");
const DB_FILE = path.join(__dirname, "..", "..", "economy.json");
module.exports = { name: "baltop", category: "economy", description: "Richest members", usage: ".baltop", permission: "user", async run() {
  try {
    const db = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
    const sorted = Object.entries(db).sort((a, b) => (b[1].wallet + b[1].bank) - (a[1].wallet + a[1].bank)).slice(0, 5);
    let msg = `🏆 *RICHEST MEMBERS*\n\n`;
    sorted.forEach(([id, data], i) => {
      msg += `${i + 1}. ${id.slice(0, 6)}... : ${data.wallet + data.bank} coins\n`;
    });
    return msg;
  } catch(e) { return "No economy data yet."; }
} };
