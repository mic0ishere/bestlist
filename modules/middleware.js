const sessions = require("./sessions");
const config = require("../config.json");
const guild = require("../data/models/guild");

module.exports.updateGuilds = async (req, res, next) => {
  try {
    const key = res.cookies.get("key");
    if (key) {
      const { guilds } = await sessions.get(key);
      res.locals.guilds = guilds;
    }
  } finally {
    return next();
  }
};

module.exports.updateUser = async (req, res, next) => {
  try {
    const key = res.cookies.get("key");
    if (key) {
      const { authUser } = await sessions.get(key);
      res.locals.user = authUser;
      res.locals.user.admin = config.admin.includes(authUser.id);
    }
  } finally {
    return next();
  }
};

module.exports.validateGuild = async (req, res, next) => {
  res.locals.guild = res.locals.guilds.find((g) => g.id === req.params.id);
  return res.locals.guild
    ? (await guild.findById(res.locals.guild.id))?.banned
      ? res.render("server-banned")
      : next()
    : res.render("404");
};

module.exports.validateUser = async (req, res, next) => {
  return res.locals.user ? next() : res.redirect("/login");
};

module.exports.validateAdminUser = async (req, res, next) => {
  return !res.locals.user
    ? res.redirect("/login")
    : !config.admin.includes(res.locals.user.id)
    ? res.render("401")
    : next();
};
