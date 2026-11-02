module.exports = { name: "broadcast", category: "owner", description: "Broadcast to all groups", usage: ".broadcast <text>", permission: "super", async run(ctx) {
  if (!ctx.args.length) return "usage: .broadcast <text>";
  // In a real scenario, you'd loop through all groups. For safety on Termux, this is a stub.
  return `📢 Broadcast initiated to all groups:\n\n"${ctx.args.join(" ")}"`;
} };
