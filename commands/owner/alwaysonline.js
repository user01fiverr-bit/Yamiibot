module.exports = { name: "alwaysonline", category: "owner", description: "Stay online on WhatsApp", usage: ".alwaysonline on/off", permission: "super", async run(ctx) {
  const state = ctx.args[0]?.toLowerCase() === "on";
  if (state) await ctx.sock.sendPresenceUpdate('available');
  else await ctx.sock.sendPresenceUpdate('unavailable');
  return `✅ Always Online: ${state ? "ON" : "OFF"}`;
} };
