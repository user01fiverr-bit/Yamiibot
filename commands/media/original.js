const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");

function run(cmd) {
    return new Promise((resolve, reject) => {
        exec(cmd, (err, stdout, stderr) => {
            if (err) return reject(new Error(stderr || err.message));
            resolve(stdout);
        });
    });
}

module.exports = {
  name: "original",
  category: "media",
  description: "Sticker to media",
  usage: "reply with .original",
  permission: "user",
  async run(ctx) {
    const q = ctx.quotedRaw;
    if (!q || !q.message.stickerMessage) return "reply to a sticker";

    const tmpDir = path.join(process.cwd(), "tmp");
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

    const tmpIn = path.join(tmpDir, "in-" + Date.now() + ".webp");
    const tmpOutVid = path.join(tmpDir, "out-" + Date.now() + ".mp4");
    const tmpOutImg = path.join(tmpDir, "out-" + Date.now() + ".png");

    try {
      const buf = await downloadMediaMessage({ key: q.key, message: q.message }, "buffer", {}, { logger: console, reuploadRequest: ctx.sock.updateMediaMessage });
      fs.writeFileSync(tmpIn, buf);

      const isAnimated = buf.toString('ascii').includes('ANIM');

      if (isAnimated) {
        let success = false;

        // Method 1: ImageMagick (magick or convert)
        try {
            await run(`magick "${tmpIn}" "${tmpOutVid}"`);
            success = true;
        } catch (e) {
            try { await run(`convert "${tmpIn}" "${tmpOutVid}"`); success = true; } catch (e2) {}
        }

        // Method 2: anim_dump + ffmpeg
        if (!success) {
            try {
                const frameDir = path.join(tmpDir, "frames-" + Date.now());
                fs.mkdirSync(frameDir);
                await run(`anim_dump -folder "${frameDir}" "${tmpIn}"`);
                await run(`ffmpeg -y -framerate 10 -i "${frameDir}/frame_%04d.png" -c:v libx264 -pix_fmt yuv420p "${tmpOutVid}"`);
                success = true;
            } catch (e) {}
        }

        // Method 3: sharp (if installed)
        if (!success) {
            try {
                const sharp = require("sharp");
                const tmpGif = path.join(tmpDir, "out-" + Date.now() + ".gif");
                await sharp(buf, { animated: true }).gif().toFile(tmpGif);
                await run(`ffmpeg -y -i "${tmpGif}" -c:v libx264 -pix_fmt yuv420p "${tmpOutVid}"`);
                success = true;
            } catch (e) {}
        }

        if (success) {
            await ctx.sock.sendMessage(ctx.jid, { video: fs.readFileSync(tmpOutVid), caption: "🎥 Original Video" }, { quoted: q });
            if (fs.existsSync(tmpOutVid)) fs.unlinkSync(tmpOutVid);
        } else {
            return "failed: Server cannot decode animated WebP. Contact bot owner.";
        }
      } else {
        await run(`ffmpeg -y -i "${tmpIn}" "${tmpOutImg}"`);
        await ctx.sock.sendMessage(ctx.jid, { image: fs.readFileSync(tmpOutImg), caption: "🖼️ Original Image" }, { quoted: q });
        if (fs.existsSync(tmpOutImg)) fs.unlinkSync(tmpOutImg);
      }
      if (fs.existsSync(tmpIn)) fs.unlinkSync(tmpIn);
    } catch (e) {
      return "failed: " + e.message;
    }
  }
};
