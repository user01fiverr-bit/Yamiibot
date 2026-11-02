module.exports = { name: "tagall", category: "group", description: "Mention everyone", usage: ".tagall <msg>", permission: "user", async run(ctx) {
  if (!ctx.jid.endsWith("@g.us")) return "❌ Group only command.";
  const meta = await ctx.sock.groupMetadata(ctx.jid);
  const mentions = meta.participants.map(p => p.id);
  const text = ctx.args.join(" ") || "Attention!";
  await ctx.sock.sendMessage(ctx.jid, { text: `📢 *${text}*\n\n` + mentions.map(m => `@${m.split("@")[0]}`).join(" "), mentions });
} };
