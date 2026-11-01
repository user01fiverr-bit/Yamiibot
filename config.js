require("dotenv").config();
const path = require("path");

// Override Termux's $PREFIX if dotenv picked it up
if (process.env.PREFIX && process.env.PREFIX.includes("com.termux")) {
  process.env.PREFIX = ".";
}

module.exports = {
  tgToken: process.env.TG_TOKEN,
  ownerTgId: String(process.env.OWNER_TG_ID || ""),
  ownerWa: String(process.env.OWNER_WA || "").replace(/\D/g, ""),
  groqKey: process.env.GROQ_KEY,
  aiModel: process.env.AI_MODEL || "openai/gpt-oss-20b",
  prefix: process.env.PREFIX || ".",
  tz: process.env.TZ || "Africa/Lagos",
  sessionsDir: path.join(__dirname, "sessions"),
  usersFile: path.join(__dirname, "users.json"),
  strangersFile: path.join(__dirname, "strangers.json"),
  greetedGroupsFile: path.join(__dirname, "greetedGroups.json"),
  botName: "Yamii",
};
