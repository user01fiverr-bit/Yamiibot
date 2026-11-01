module.exports = { name: "groupinfo", category: "group", description: "Group stats", usage: ".groupinfo", permission: "user", async run(ctx) {
  if (!ctx.jid.endsWith("@g.us")) return "❌ Group only command.";
  const m = await ctx.sock.groupMetadata(ctx.jid);
  return `📊 *Group Info*\nName: ${m.subject}\nMembers: ${m.participants.length}\nDesc: ${m.desc || "None"}`;
} };
