module.exports = { name: "wyr", category: "games", description: "Would you rather", usage: ".wyr", permission: "user", async run() {
  const q = [
    "Would you rather fight 1 horse-sized duck or 100 duck-sized horses?",
    "Would you rather be able to fly or be invisible?",
    "Would you rather never use social media again or never watch another movie?",
    "Would you rather be rich but ugly or poor but beautiful?"
  ];
  return `🤔 ${q[Math.floor(Math.random()*q.length)]}`;
} };
