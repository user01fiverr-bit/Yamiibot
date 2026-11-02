module.exports = { name: "kebab", category: "text", description: "kebab-case", usage: ".kebab hello world", permission: "user", async run(ctx) { return ctx.args.join("-").toLowerCase(); } };
