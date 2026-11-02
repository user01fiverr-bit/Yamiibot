module.exports = {
  name: "ask", aliases: ["ai"], category: "ai", description: "Ask the AI anything", usage: ".ask <question>", permission: "user",
  async run(ctx) { if (!ctx.args.length) return "usage: .ask <question>"; return await ctx.ai.ask(ctx.args.join(" ")); },
};
