const fs = require("fs"); const path = require("path"); const os = require("os"); const { execFile } = require("child_process"); const { downloadMediaMessage } = require("@whiskeysockets/baileys");
module.exports = { name: "original", category: "media", description: "Sticker to media", usage: "reply with .original", permission: "user", async run(ctx) {
  if (process.platform === "android") return "❌ Termux cannot decode animated WebP. This command will work automatically when you move to the Cloud.";
  const q=ctx.quotedRaw; if(!q || !q.message.stickerMessage) return "reply to a sticker"; 
  const tmpIn=path.join(os.tmpdir(),"in.webp"); const tmpOut=path.join(os.tmpdir(),"out.mp4"); 
  try{ 
    const buf = await downloadMediaMessage({key: q.key, message: q.message}, "buffer", {}, { logger: console, reuploadRequest: ctx.sock.updateMediaMessage }); 
    fs.writeFileSync(tmpIn, buf); 
    await new Promise((res,rej)=>execFile("ffmpeg",["-y","-i",tmpIn,"-c:v","libx264","-pix_fmt","yuv420p",tmpOut],(e)=>e?rej(e):res())); 
    await ctx.sock.sendMessage(ctx.jid, { video: fs.readFileSync(tmpOut) }, { quoted: q }); 
    fs.unlinkSync(tmpIn); fs.unlinkSync(tmpOut); 
  }catch(e){ return "failed: "+e.message; } 
} };
