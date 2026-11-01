module.exports = { name: "italic", category: "text", description: "Italicize text", usage: ".italic hello", permission: "user", async run(ctx) { return "_" + ctx.args.join(" ") + "_"; } };
