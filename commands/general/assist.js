module.exports = { name: "assist", category: "general", description: "AI guide to the bot", usage: ".assist how do I link?", permission: "user", async run(ctx) {
  if (!ctx.args.length) return "🤖 *Yamii Assist*\nAsk me anything about how to use this bot.\nExample: `.assist how do I connect WhatsApp?`";
  const q = ctx.args.join(" ");
  const system = `You are Yamii Assist, the official AI guide for the Yamii AI WhatsApp bot. 
  The user is asking: "${q}". 
  Answer them clearly and briefly. 
  Here are the bot's features: 253 commands, 15 categories. 
  To link WhatsApp, they must use the Telegram bot and type /connect.
  To use commands, they type a dot followed by the command (e.g., .ping, .menu, .daily).
  Commands are grouped into AI, Media, Economy, Games, Tools, etc.`;
  return await ctx.ai.ask(q, system);
} };
