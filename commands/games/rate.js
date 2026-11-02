module.exports = { name: "rate", category: "games", description: "Rate something", usage: ".rate <thing>", permission: "user", async run(ctx) {
  return `I rate ${ctx.args.join(" ") || "you"} ${Math.floor(Math.random()*10)+1}/10`;
} };
