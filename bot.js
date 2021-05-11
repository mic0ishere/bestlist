const { Client } = require("discord.js");
const credentials = require("./credentials.json");
const guilds = require("./data/guilds");
const bot = new Client();
module.exports.bot = bot;
module.exports.start = function () {
  bot.once("ready", () => {
    bot.user.setPresence({
      activity: {
        name: "IN DEVELOPMENT MODE",
        type: "PLAYING",
      },
      status: "online",
    });
    console.log(bot.user.username + " is ready");
    bot.guilds.cache.forEach(async (x) => {
      await guilds.get(x.id);
    });
  });
  bot.login(credentials.bot.token);
};
