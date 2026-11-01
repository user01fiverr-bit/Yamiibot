module.exports = {
  name: "menu", aliases: ["m", "help"], category: "general", description: "Show all commands", usage: ".menu", permission: "user",
  async run(ctx) {
    const cats = ctx.registry.categories();
    const total = ctx.registry.count();
    
    let text = `✨ *${ctx.config.botName.toUpperCase()} MENU* ✨\n`;
    text += `━━━━━━━━━━━━━━━━━━\n`;
    text += `Total Commands: *${total}*\n\n`;
    
    for (const cat of cats) {
      const count = ctx.registry.inCategory(cat).length;
      text += `📌 *${cat.toUpperCase()}* (${count})\n`;
    }
    
    text += `\n━━━━━━━━━━━━━━━━━━\n`;
    text += `💡 To find a command, type:\n\`.find <keyword>\`\nExample: \`.find sticker\``;
    
    return text;
  },
};
