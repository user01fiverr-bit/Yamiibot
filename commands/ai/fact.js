module.exports = { name: "fact", category: "ai", description: "Random fact", usage: ".fact", permission: "user", async run(ctx) { return await ctx.ai.ask("Tell me an interesting fact."); } };
