module.exports = { name: "rps", category: "games", description: "Rock Paper Scissors", usage: ".rps rock", permission: "user", async run(ctx) {
  const moves = ["rock", "paper", "scissors"];
  const botMove = moves[Math.floor(Math.random()*3)];
  const userMove = ctx.args[0]?.toLowerCase();
  if (!moves.includes(userMove)) return "usage: .rps rock | paper | scissors";
  if (userMove === botMove) return `🤝 It's a tie! We both chose ${botMove}.`;
  if ((userMove === "rock" && botMove === "scissors") || (userMove === "paper" && botMove === "rock") || (userMove === "scissors" && botMove === "paper")) {
    return `🏆 You win! ${userMove} beats ${botMove}.`;
  }
  return `❌ You lose! ${botMove} beats ${userMove}.`;
} };
