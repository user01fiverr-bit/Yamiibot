module.exports = { name: "clap", category: "text", description: "Add claps between words", usage: ".clap hello world", permission: "user", async run(ctx) { return ctx.args.join(" 👏 ") + " 👏"; } };
