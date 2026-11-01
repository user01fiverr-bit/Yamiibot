module.exports = { name: "bold", category: "text", description: "Bold text", usage: ".bold hello", permission: "user", async run(ctx) { return "*" + ctx.args.join(" ") + "*"; } };
