module.exports = { name: "hex", category: "tools", description: "Text to hex", usage: ".hex <text>", permission: "user", async run(ctx) { return Buffer.from(ctx.args.join(" ")).toString("hex"); } };
