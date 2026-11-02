const crypto = require("crypto");
module.exports = { name: "uuid", category: "tools", description: "Generate UUID", usage: ".uuid", permission: "user", async run() { return crypto.randomUUID(); } };
