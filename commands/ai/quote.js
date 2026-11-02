module.exports = { name: "quote", category: "ai", description: "AI quote", usage: ".quote", permission: "user", async run(ctx) { return await ctx.ai.ask("Give me an inspiring quote."); } };
