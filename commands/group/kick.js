module.exports = { name: "kick", category: "group", description: "Remove a member", usage: ".kick @user", permission: "user", async run(ctx) {
  if (!ctx.jid.endsWith("@g.us")) return "❌ Group only command.";
  const mentioned = ctx.quotedRaw?.key?.participant || (ctx.args[0] ? ctx.args[0].replace(/\D/g, "") + "@s.whatsapp.net" : null);
  if (!mentioned) return "Reply to a message or type a number.";
  await ctx.sock.groupParticipantsUpdate(ctx.jid, [mentioned], "remove");
  return "✅ Kicked.";
} };
