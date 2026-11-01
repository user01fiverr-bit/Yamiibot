module.exports = { name: "dare", category: "games", description: "Dare challenge", usage: ".dare", permission: "user", async run() {
  const d = ["Send a selfie right now.", "Voice note yourself singing.", "Message your crush.", "Change your status to 'I love Yamii AI' for 1 hour.", "Send the last photo in your gallery."];
  return `🔥 DARE: ${d[Math.floor(Math.random()*d.length)]}`;
} };
