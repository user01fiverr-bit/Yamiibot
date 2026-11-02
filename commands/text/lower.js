module.exports = { name: "lower", category: "text", description: "Lowercase", usage: ".lower <text>", permission: "user", async run(ctx) { return ctx.args.join(" ").toLowerCase(); } };
