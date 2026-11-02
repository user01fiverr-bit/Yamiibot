module.exports = { name: "img", category: "search", description: "Image search", usage: ".img cars", permission: "user", async run(ctx) {
  if (!ctx.args.length) return "usage: .img <query>";
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(ctx.args.join(" "))}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random()*1e6)}`;
  await ctx.send(url);
} };
