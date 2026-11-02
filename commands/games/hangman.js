const games = require("../../lib/games");
module.exports = { name: "hangman", category: "games", description: "Hangman", usage: ".hangman <letter>", permission: "user", async run(ctx) {
  const words = ["yamii", "cloud", "python", "server", "whatsapp"];
  let g = games.get(ctx.jid + "_hang");
  if (!g) { g = { word: words[Math.floor(Math.random()*words.length)], guessed: [] }; games.set(ctx.jid + "_hang", g); }
  const letter = ctx.args[0]?.toLowerCase();
  if (letter && letter.length === 1 && !g.guessed.includes(letter)) g.guessed.push(letter);
  games.set(ctx.jid + "_hang", g);
  const display = g.word.split("").map(c => g.guessed.includes(c) ? c : "_").join(" ");
  const win = g.word.split("").every(c => g.guessed.includes(c));
  if (win) { games.del(ctx.jid + "_hang"); return `🎉 You won! The word was *${g.word}*.`; }
  return `🪢 *Hangman*\n\n${display}\n\nGuessed: ${g.guessed.join(", ")}\nReply with \`.hangman <letter>\``;
} };
