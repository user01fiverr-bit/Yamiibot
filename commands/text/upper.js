module.exports = { name: "upper", category: "text", description: "Uppercase", usage: ".upper <text>", permission: "user", async run(ctx) { return ctx.args.join(" ").toUpperCase(); } };
