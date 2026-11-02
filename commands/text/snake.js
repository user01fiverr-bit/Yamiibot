module.exports = { name: "snake", category: "text", description: "snake_case", usage: ".snake hello world", permission: "user", async run(ctx) { return ctx.args.join("_").toLowerCase(); } };
