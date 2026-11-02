module.exports = { name: "settings", category: "owner", description: "View bot settings", usage: ".settings", permission: "super", async run(ctx) {
  return `⚙️ *BOT SETTINGS*\n\nPrefix: ${ctx.config.prefix}\nMode: Public\nAnti-Delete: ON\nAlways Online: OFF\nAuto-Read: OFF`;
} };
