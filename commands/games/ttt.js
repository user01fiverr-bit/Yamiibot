const games = require("../../lib/games");
module.exports = { name: "ttt", category: "games", description: "Tic-Tac-Toe", usage: ".ttt <1-9>", permission: "user", async run(ctx) {
  let g = games.get(ctx.jid) || { board: ["1","2","3","4","5","6","7","8","9"], turn: "X" };
  if (ctx.args[0] && !isNaN(ctx.args[0])) {
    const pos = parseInt(ctx.args[0]) - 1;
    if (pos >= 0 && pos <= 8 && g.board[pos] !== "X" && g.board[pos] !== "O") g.board[pos] = "X";
  }
  // Simple AI (Random empty spot)
  let empty = g.board.map((v,i) => v !== "X" && v !== "O" ? i : null).filter(v => v !== null);
  if (empty.length) g.board[empty[Math.floor(Math.random()*empty.length)]] = "O";
  games.set(ctx.jid, g);
  return `🎮 *Tic-Tac-Toe*\n\n${g.board[0]} | ${g.board[1]} | ${g.board[2]}\n---------\n${g.board[3]} | ${g.board[4]} | ${g.board[5]}\n---------\n${g.board[6]} | ${g.board[7]} | ${g.board[8]}\n\nReply with \`.ttt <number>\` to play!`;
} };
