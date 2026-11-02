module.exports = { name: "hangman", category: "games", description: "Classic hangman", usage: ".hangman", permission: "user", async run(ctx) {
  return `🪢 *HANGMAN*\n_ _ _ _ _\n\nType \`.hangman <letter>\` to guess.`;
} };
