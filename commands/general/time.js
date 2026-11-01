module.exports = { name: "time", category: "general", description: "Current time", usage: ".time", permission: "user", async run() { return new Date().toLocaleString(); } };
