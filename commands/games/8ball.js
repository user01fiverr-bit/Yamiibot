module.exports = { name: "8ball", category: "games", description: "Magic 8-Ball", usage: ".8ball <question>", permission: "user", async run(ctx) {
  const answers = ["Yes.", "No.", "Maybe.", "Definitely.", "Absolutely not.", "Ask again later.", "I don't know.", "Without a doubt.", "Very doubtful."];
  return `🎱 ${answers[Math.floor(Math.random()*answers.length)]}`;
} };
