const fs = require("fs");
const path = require("path");
const os = require("os");

module.exports = {
  name: "tts",
  category: "media",
  description: "Turn text into audio (MP3)",
  usage: ".tts <text> OR reply to text with .tts",
  permission: "user",
  async run(ctx) {
    let textToSpeak = "";
    if (ctx.quotedRaw && ctx.quotedRaw.message) {
      textToSpeak = ctx.quotedRaw.message.conversation || ctx.quotedRaw.message.extendedTextMessage?.text || "";
    }
    if (!textToSpeak.trim() && ctx.args.length > 0) {
      textToSpeak = ctx.args.join(" ");
    }
    if (!textToSpeak.trim()) return "⚠️ Reply to a text or type `.tts <text>`.";

    await ctx.reply("🎙 generating audio...");
    
    const mp3 = path.join(os.tmpdir(), "tts-" + Date.now() + ".mp3");

    try {
      // 1. Download from VoiceRSS
      await ctx.ai.speak(textToSpeak, mp3);
      
      // 2. Send directly as an MP3 audio file (No ffmpeg conversion)
      const buf = fs.readFileSync(mp3);
      await ctx.sock.sendMessage(ctx.jid, { 
        audio: buf, 
        mimetype: "audio/mpeg", 
        ptt: false // Send as a normal audio file, not a voice note
      }, { quoted: ctx.quotedRaw || undefined });
      
      fs.unlinkSync(mp3);
    } catch (e) {
      return "❌ tts failed: " + e.message;
    }
  },
};
