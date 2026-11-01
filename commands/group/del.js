module.exports = { name: "del", category: "group", description: "Delete replied message", usage: "reply .del", permission: "user", async run(ctx) {
  if (!ctx.quotedRaw) return "Reply to a message to delete it.";
  await ctx.sock.sendMessage(ctx.jid, { delete: ctx.quotedRaw.key });
} };
