module.exports = { name: "timestamp", aliases: ["ts"], category: "tools", description: "Unix timestamp", usage: ".ts", permission: "user", async run() { return `${Math.floor(Date.now()/1000)}`; } };
