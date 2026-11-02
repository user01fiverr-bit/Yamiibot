module.exports = { name: "count", category: "text", description: "Count characters", usage: ".count <text>", permission: "user", async run(ctx) { return `chars: ${ctx.args.join(" ").length}`; } };
