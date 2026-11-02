module.exports = { name: "trim", category: "text", description: "Trim spaces", usage: ".trim <text>", permission: "user", async run(ctx) { return ctx.args.join(" ").trim(); } };
