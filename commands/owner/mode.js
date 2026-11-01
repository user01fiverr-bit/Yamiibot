module.exports = { name: "mode", category: "owner", description: "Set bot mode (public/private)", usage: ".mode public", permission: "super", async run(ctx) {
  if (!["public", "private"].includes(ctx.args[0]?.toLowerCase())) return "usage: .mode public/private";
  return `✅ Bot mode set to *${ctx.args[0].toUpperCase()}*`;
} };
