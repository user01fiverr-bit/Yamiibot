const eco = require("../../lib/economy");
module.exports = { name: "hunt", category: "economy", description: "Hunt for animals", usage: ".hunt", permission: "user", async run(ctx) { const a=["🐇 Rabbit (50c)","🦊 Fox (150c)","🦌 Deer (300c)","🐉 Dragon (5000c)"]; const r=a[Math.floor(Math.random()*a.length)]; return `🏹 You hunted: ${r}`; } };
