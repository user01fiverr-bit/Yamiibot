const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');
const zlib = require('zlib');

// CHANGE: Use the system /tmp directory instead of the blocked /home/container folder
const binDir = path.join(os.tmpdir(), 'yamii-bin');
if (!fs.existsSync(binDir)) fs.mkdirSync(binDir, { recursive: true });
const ffmpegPath = path.join(binDir, 'ffmpeg');

async function downloadFFmpeg() {
  if (fs.existsSync(ffmpegPath)) return ffmpegPath;
  console.log("[ffmpeg] Downloading working static binary...");
  return new Promise((resolve, reject) => {
    const url = 'https://github.com/eugeneware/ffmpeg-static/releases/download/b5.0/linux-x64.gz';
    https.get(url, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        return https.get(res.headers.location, (res2) => {
           const chunks = [];
           res2.on('data', c => chunks.push(c));
           res2.on('end', () => {
             const buf = Buffer.concat(chunks);
             const decompressed = zlib.gunzipSync(buf);
             fs.writeFileSync(ffmpegPath, decompressed);
             fs.chmodSync(ffmpegPath, 0o755);
             console.log("[ffmpeg] Downloaded and ready in /tmp.");
             resolve(ffmpegPath);
           });
        }).on('error', reject);
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
         const buf = Buffer.concat(chunks);
         const decompressed = zlib.gunzipSync(buf);
         fs.writeFileSync(ffmpegPath, decompressed);
         fs.chmodSync(ffmpegPath, 0o755);
         resolve(ffmpegPath);
      });
    }).on('error', reject);
  });
}
module.exports = { downloadFFmpeg };
