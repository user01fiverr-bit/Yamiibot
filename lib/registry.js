const fs = require("fs");
const path = require("path");

let commands = new Map();
let byCategory = new Map();

function walk(dir, list = []) {
  if (!fs.existsSync(dir)) return list;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, list);
    else if (entry.name.endsWith(".js")) list.push(full);
  }
  return list;
}

function load() {
  commands = new Map();
  byCategory = new Map();
  const root = path.join(__dirname, "..", "commands");
  for (const file of walk(root)) {
    try {
      delete require.cache[require.resolve(file)];
      const mod = require(file);
      if (!mod || !mod.name || typeof mod.run !== "function") continue;
      mod.file = file;
      commands.set(mod.name, mod);
      if (Array.isArray(mod.aliases)) mod.aliases.forEach((a) => commands.set(a, mod));
      const cat = mod.category || "general";
      if (!byCategory.has(cat)) byCategory.set(cat, []);
      byCategory.get(cat).push(mod);
    } catch (e) {}
  }
}

function search(term) {
  term = String(term).toLowerCase();
  return all().filter((c) => c.name.toLowerCase().includes(term) || (c.description || "").toLowerCase().includes(term) || (c.category || "").toLowerCase().includes(term));
}

function get(name) { return commands.get(name); }
function all() { return [...new Set(commands.values())]; }
function categories() { return [...byCategory.keys()].sort(); }
function inCategory(cat) { return byCategory.get(cat) || []; }
function count() { return all().length; }

load();
module.exports = { load, get, all, categories, inCategory, count, search };
