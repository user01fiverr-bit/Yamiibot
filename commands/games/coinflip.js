module.exports = { name: "coinflip", aliases: ["cf"], category: "games", description: "Heads or Tails", usage: ".coinflip", permission: "user", async run() {
  return Math.random() < 0.5 ? "🪙 *HEADS*" : "🪙 *TAILS*";
} };
