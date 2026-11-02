module.exports = { name: "joke", category: "ai", description: "AI joke", usage: ".joke", permission: "user", async run(ctx) { return await ctx.ai.ask("Tell me a short, funny joke."); } };
