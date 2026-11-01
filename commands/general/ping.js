module.exports = {
  name: "ping", aliases: ["p"], category: "general", description: "Check bot latency", usage: ".ping", permission: "user",
  async run() { return `pong — ${Date.now() % 1000}ms`; },
};
