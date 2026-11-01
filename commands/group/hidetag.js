module.exports = { name: "hidetag", category: "group", description: "Silent mention", usage: ".hidetag <msg>", permission: "user", async run(ctx) {
  if (!ctx.jid.endsWith("@g.us")) return "❌ Group only command.";
  const meta = await ctx.sock.groupMetadata(ctx.jid);
  const mentions = meta.participants.map(p => p.id);
  const text = ctx.args.join(" ") || "\u200b";
  await ctx.sock.sendMessage(ctx.jid, { text, mentions });
} };
