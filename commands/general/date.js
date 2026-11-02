module.exports = { name: "date", category: "general", description: "Current date", usage: ".date", permission: "user", async run() { return new Date().toDateString(); } };
