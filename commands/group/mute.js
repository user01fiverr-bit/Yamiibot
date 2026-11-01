module.exports = { name: "mute", category: "group", description: "Lock group", usage: ".mute", permission: "user", async run(ctx) {
  if (!ctx.jid.endsWith("@g.us")) return "❌ Group only command.";
  await ctx.sock.groupSettingUpdate(ctx.jid, "announcement");
  return "🔒 Group locked (only admins can send).";
} };
