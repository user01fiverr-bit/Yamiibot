module.exports = { name: "strike", category: "text", description: "Strikethrough text", usage: ".strike hello", permission: "user", async run(ctx) { return "~" + ctx.args.join(" ") + "~"; } };
