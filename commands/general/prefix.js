module.exports = { name: "prefix", category: "general", description: "View prefix", usage: ".prefix", permission: "user", async run(ctx) { return `Current prefix: ${ctx.config.prefix}`; } };
