module.exports = { name: "insult", category: "games", description: "Playful insult", usage: ".insult", permission: "user", async run() {
  const i = ["Your code is so messy even the compiler gave up.", "You are the human equivalent of a syntax error.", "You bring everyone so much joy... when you leave the room."];
  return `😈 ${i[Math.floor(Math.random()*i.length)]}`;
} };
