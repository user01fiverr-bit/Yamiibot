module.exports = { name: "roll", category: "games", description: "Roll dice (e.g., 2d6)", usage: ".roll 1d6", permission: "user", async run(ctx) {
  const match = (ctx.args[0] || "1d6").split("d");
  const num = parseInt(match[0]) || 1;
  const sides = parseInt(match[1]) || 6;
  let total = 0;
  for(let i=0; i<num; i++) total += Math.floor(Math.random()*sides)+1;
  return `🎲 You rolled ${num}d${sides}: *${total}*`;
} };
