module.exports = { name: "coin", aliases: ["flip"], category: "fun", description: "Flip a coin", usage: ".coin", permission: "user", async run() { return Math.random()<0.5?"🪙 heads":"🪙 tails"; } };
