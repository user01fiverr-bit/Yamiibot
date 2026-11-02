const Groq = require("groq-sdk");
const fs = require("fs");
const config = require("../config");

const groq = new Groq({ apiKey: config.groqKey });
const TTS_KEY = process.env.TTS_KEY || "";

async function ask(prompt, system) {
  try {
    const r = await groq.chat.completions.create({
      model: config.aiModel,
      messages: [
        { role: "system", content: system || `You are ${config.botName}, a helpful assistant.` },
        { role: "user", content: prompt },
      ],
      temperature: 0.7, max_tokens: 800,
    });
    return r.choices[0]?.message?.content?.trim() || "(no reply)";
  } catch (e) {
    return `(AI error: ${e.message})`;
  }
}

async function speak(text, outFile) {
  if (!TTS_KEY) throw new Error("no TTS_KEY in .env");
  const clean = String(text).slice(0, 300);
  const url = `https://api.voicerss.org/?key=${TTS_KEY}&hl=en-us&c=MP3&f=44khz_16bit_stereo&src=${encodeURIComponent(clean)}`;
  
  // Add a 10-second timeout so the bot never freezes
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    
    if (!res.ok) throw new Error("tts http " + res.status);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.slice(0, 6).toString().startsWith("ERROR")) throw new Error("voicerss error");
    fs.writeFileSync(outFile, buf);
    return outFile;
  } catch (e) {
    clearTimeout(timeout);
    throw new Error(e.name === 'AbortError' ? "VoiceRSS API timed out" : e.message);
  }
}

module.exports = { ask, speak };
