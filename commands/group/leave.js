module.exports = { name: "leave", category: "group", description: "Leave group", usage: ".leave", permission: "user", async run(ctx) { await ctx.sock.groupLeave(ctx.jid); } };
