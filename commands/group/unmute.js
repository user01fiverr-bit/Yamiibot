module.exports = { name: "unmute", category: "group", description: "Unlock group", usage: ".unmute", permission: "user", async run(ctx) {
  if (!ctx.jid.endsWith("@g.us")) return "❌ Group only command.";
  await ctx.sock.groupSettingUpdate(ctx.jid, "not_announcement");
  return "🔓 Group unlocked.";
} };
