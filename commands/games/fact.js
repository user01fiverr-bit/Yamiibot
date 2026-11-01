module.exports = { name: "fact", category: "games", description: "Random fact", usage: ".fact", permission: "user", async run() {
  const f = ["Bananas are berries, but strawberries aren't.", "Octopuses have three hearts.", "Honey never spoils.", "A day on Venus is longer than a year on Venus."];
  return `🧠 ${f[Math.floor(Math.random()*f.length)]}`;
} };
