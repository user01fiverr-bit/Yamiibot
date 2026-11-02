module.exports = { name: "demote", category: "group", description: "Remove admin", usage: ".demote @user", permission: "user", async run(ctx) {
  if (!ctx.jid.endsWith("@g.us")) return "❌ Group only command.";
  const mentioned = ctx.quotedRaw?.key?.participant || (ctx.args[0] ? ctx.args[0].replace(/\D/g, "") + "@s.whatsapp.net" : null);
  if (!mentioned) return "Reply to a message or type a number.";
  await ctx.sock.groupParticipantsUpdate(ctx.jid, [mentioned], "demote");
  return "✅ Demoted.";
} };
