module.exports = {
  name: "menu", aliases: ["m", "help"], category: "general", description: "Show all commands", usage: ".menu", permission: "user",
  async run(ctx) {
    const cats = ctx.registry.categories();
    const total = ctx.registry.count();
    
    let text = `✨ *${ctx.config.botName.toUpperCase()} MENU* ✨\n`;
    text += `━━━━━━━━━━━━━━━━━━\n`;
    text += `🤖 *Total Commands:* ${total}\n\n`;
    
    for (const cat of cats) {
      const items = ctx.registry.inCategory(cat);
      
      // Category Header
      text += `📌 *${cat.toUpperCase()}* (${items.length})\n`;
      
      // Command List
      for (const c of items) {
        text += ` ├ \`${ctx.config.prefix}${c.name}\` — _${c.description || "no description"}_\n`;
      }
      text += `\n`; // Space between categories
    }
    
    text += `━━━━━━━━━━━━━━━━━━\n`;
    text += `💡 *Tip:* Type \`.find <keyword>\` to search for a specific command.`;
    
    return text;
  },
};
