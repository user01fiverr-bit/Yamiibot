module.exports = { name: "emojify", category: "text", description: "Text to emojis", usage: ".emojify <text>", permission: "user", async run(ctx) { return ctx.args.join(" ").split("").join(" "); } };
