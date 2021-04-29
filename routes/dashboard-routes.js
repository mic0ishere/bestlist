const express = require("express");
const fetch = require("node-fetch");
const { validateGuild } = require("../modules/middleware");
const guilds = require("../data/guilds");
const guild = require("../data/models/guild");
const bot = require('../bot').bot

const router = express.Router();

router.get("/dashboard", async (req, res) => {
  await fetch(`${process.env.DASHBOARD}/getStats`).then(async (statsRes) => {
    const stats = await statsRes.json();
    await fetch(
      `${process.env.DASHBOARD}/getUserGuilds/${res.locals.user.id}`
    ).then(async (userServersRes) => {
      const userServers = await userServersRes.json();
      res.render("dashboard", {
        userServers: userServers,
        stats: stats,
      });
    });
  });
});
router.get("/manage/:id", validateGuild, async (req, res) => {
  await fetch(`${process.env.DASHBOARD}/getGuild/${req.params.id}`).then(
    async (guildRes) => {
      const guild = await guildRes.json();
      await fetch(`${process.env.DASHBOARD}/getStats`).then(async (statsRes) => {
        const stats = await statsRes.json();
        await fetch(
          `${process.env.DASHBOARD}/getUserGuilds/${res.locals.user.id}`
        ).then(async (userServersRes) => {
          const userServers = await userServersRes.json();
          res.render("server-dashboard", {
            guild: guild,
            userServers: userServers,
            stats: stats,
          });
        });
      });
    }
  );
});

router.get("/manage/:id/edit", validateGuild, async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      description,
      backgroundColor,
      fontColorMain,
      buttonColor,
      directUrl,
      badgeColor,
      fontColorSecond,
      status,
      short_description
    } = req.query;
    const savedGuild = await guilds.get(id);
    if (description) description.length < 250 ? savedGuild.description = description : savedGuild.description = description.slice(0, 250)
    if (short_description) short_description.length < 50 ? savedGuild.short_description = short_description : savedGuild.short_description = short_description.slice(0, 50)
    if (status) savedGuild.status = true;
    if (!status) savedGuild.status = false;
    if (savedGuild.isPremium) {
      if (backgroundColor)
        savedGuild.premiumData.backgroundColor = backgroundColor.toString();
      if (fontColorMain)
        savedGuild.premiumData.fontColorMain = fontColorMain.toString();
      if (fontColorSecond)
        savedGuild.premiumData.fontColorSecond = fontColorSecond.toString();
      if (buttonColor)
        savedGuild.premiumData.buttonColor = buttonColor.toString();
      if (directUrl) savedGuild.premiumData.directUrl = directUrl.toString();
      if (badgeColor) savedGuild.premiumData.badgeColor = badgeColor.toString();
    }
    await guild.findByIdAndUpdate(id, savedGuild);

    res.redirect(`/manage/${id}`);
  } catch (error) {
    console.log(error);
    res.redirect('/')
  }
});

router.get("/manage/:id/reset", validateGuild, async (req, res) => {
  try {
    const { id } = req.params
    await guild.findByIdAndRemove(id)
    await bot.guilds.cache.get(id)?.leave()

    res.redirect(`/dashboard`);
  } catch (error) {
    console.log(error);
    res.redirect('/')
  }
});
module.exports = router;