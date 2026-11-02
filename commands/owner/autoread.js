module.exports = { name: "autoread", category: "owner", description: "Auto-read incoming messages", usage: ".autoread on/off", permission: "super", async run(ctx) {
  return `✅ Auto-Read is now ${ctx.args[0] === "on" ? "ON" : "OFF"}.`;
} };
