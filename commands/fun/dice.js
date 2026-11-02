module.exports = { name: "dice", aliases: ["roll"], category: "fun", description: "Roll a die", usage: ".dice", permission: "user", async run() { return `🎲 ${1+Math.floor(Math.random()*6)}`; } };
