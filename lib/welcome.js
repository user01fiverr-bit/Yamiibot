const fs = require("fs");
const path = require("path");

const LOCAL_IMAGE = path.join(__dirname, "..", "assets", "welcome.png");

function caption(botname, prefix) {
  return (
`✨ *${botname} is live* ✨
━━━━━━━━━━━━━━━

👋 *Welcome.* Your WhatsApp is now connected. You control everything from this chat.

🔌 *How to use*
Send \`.menu\` here to see every command.
Type any command starting with \`${prefix}\` and the bot responds.

📜 *Try these*
┣ \`${prefix}menu\` — see everything
┣ \`${prefix}ping\` — check alive
┣ \`${prefix}ask <question>\` — talk to AI
┣ \`${prefix}imagine <prompt>\` — generate an image
┗ \`${prefix}find <word>\` — search commands

👁 *View-once media is auto-captured.*
Use \`${prefix}vo list\` to see it.

🔒 *Nobody else triggers your bot.*
Only you can use commands. Strangers get a greeting.

━━━━━━━━━━━━━━━
*Send \`${prefix}menu\` to begin.*`
  );
}

async function sendWelcomeCard(sock, number, botname, prefix) {
  const text = caption(botname, prefix);
  const jid = `${number}@s.whatsapp.net`;
  try {
    if (fs.existsSync(LOCAL_IMAGE)) {
      const buf = fs.readFileSync(LOCAL_IMAGE);
      await sock.sendMessage(jid, { image: buf, caption: text });
      return;
    }
  } catch (e) { console.log("[welcome] image fail:", e.message); }
  await sock.sendMessage(jid, { text });
}

module.exports = { sendWelcomeCard };
