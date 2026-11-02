const eco = require("../../lib/economy");
module.exports = { name: "fish", category: "economy", description: "Go fishing", usage: ".fish", permission: "user", async run(ctx) { const a=["🐟 Fish (20c)","🐠 Tropical (50c)","🦈 Shark (200c)","🐋 Whale (1000c)"]; const r=a[Math.floor(Math.random()*a.length)]; return `🎣 You caught: ${r}`; } };
