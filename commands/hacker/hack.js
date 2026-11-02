module.exports = {
  name: "hack",
  category: "hacker",
  description: "Cyber intrusion simulation",
  usage: ".hack",
  permission: "user",
  async run(ctx) {
    const delay = (ms) => new Promise(r => setTimeout(r, ms));

    await ctx.reply("💻 `[SYS] Initializing cyber intrusion framework...`");
    await delay(1200);
    await ctx.reply("📡 `[NET] Target IP acquired. Bypassing firewall...`");
    await delay(1500);
    await ctx.reply("🔓 `[PAY] Root access granted. Injecting zero-day payload...`");
    await delay(1300);
    await ctx.reply("🗄️ `[DATA] Cloning encrypted database tables... 100%`");
    await delay(1200);
    await ctx.reply("📂 `[DATA] Extracting media vault: [GALLERY] [CHATS] [AUDIO]...`");
    await delay(1500);
    await ctx.reply("📡 `[NET] Exfiltrating 4.2 GB to secure offshore server...`");
    await delay(1500);
    await ctx.reply("⚠️ `[SYS] Data secured. Trace wiped. Connection terminated.`");
  }
};
