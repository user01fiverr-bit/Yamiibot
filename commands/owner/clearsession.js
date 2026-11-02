const fs = require("fs"); const path = require("path");
module.exports = { name: "clearsession", category: "owner", description: "Clear session files", usage: ".clearsession", permission: "super", async run(ctx) {
  return `⚠️ To clear sessions, use /disconnect in Telegram.`;
} };
