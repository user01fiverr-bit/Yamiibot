module.exports = { name: "id", category: "general", description: "Get Chat ID", usage: ".id", permission: "user", async run(ctx) { return `JID: ${ctx.jid}`; } };
