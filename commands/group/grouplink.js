module.exports = { name: "grouplink", category: "group", description: "Get invite link", usage: ".grouplink", permission: "user", async run(ctx) {
  if (!ctx.jid.endsWith("@g.us")) return "❌ Group only command.";
  const code = await ctx.sock.groupInviteCode(ctx.jid);
  return `🔗 https://chat.whatsapp.com/${code}`;
} };
