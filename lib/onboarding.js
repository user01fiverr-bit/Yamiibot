const fs = require("fs");
const path = require("path");
const config = require("../config");

const VERIFIED_FILE = path.join(__dirname, "..", "verified.json");

function getVerified() {
  try { return JSON.parse(fs.readFileSync(VERIFIED_FILE, "utf8")); } catch { return {}; }
}
function saveVerified(data) {
  fs.writeFileSync(VERIFIED_FILE, JSON.stringify(data, null, 2));
}
function isVerified(tgId) {
  return !!getVerified()[String(tgId)];
}
function markVerified(tgId) {
  const v = getVerified();
  v[String(tgId)] = true;
  saveVerified(v);
}

function getWelcomeText() {
  return (
`✨ *WELCOME TO YAMII AI* ✨
_The Ultimate WhatsApp Automation Tool_
━━━━━━━━━━━━━━━

🤖 *What is this Bot?*
Yamii AI connects directly to your WhatsApp. It gives you a superpower: a powerful AI assistant, an auto-responder for strangers, and over 118+ tools right inside your chats. 

🔥 *What can it do?*
┣ 🧠 *AI Chat:* Ask questions, write essays, generate code.
┣ 🎨 *Image Gen:* Create AI images instantly.
┣ 🎭 *Media Tools:* Create stickers, convert images to video, transcribe voice notes.
┣ 👁️ *Anti-Delete:* Secretly saves messages people delete.
┣ 🛡️ *Auto-Reply:* Replies to strangers while you are away.
┣ 📂 *Downloads:* Get YouTube, TikTok, and Instagram links.
┗ ⚙️ *Group Management:* Tag all, mute, and control groups.

👨‍💻 *Who made it?*
This system was built by *Yamii Tech*. 
To get updates, tutorials, and support, you must follow our official TikTok account: 
👉 *@omohyamii*

🔒 *HOW TO UNLOCK:*
To prevent spam, access is locked. You *must* follow the TikTok page above before using the bot.
Tap the button below to confirm you have followed.`
  );
}

module.exports = { getWelcomeText, isVerified, markVerified };
