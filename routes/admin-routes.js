const express = require("express");
const fetch = require("node-fetch");
const config = require("../config.json");
const guild = require("../data/models/guild");
const { validateAdminUser } = require("../modules/middleware");
const bot = require("../bot").bot;

const router = express.Router();

router.get("/admin", validateAdminUser, async (req, res) => {
  let guilds = [];
  let i = 0;
  let toAddBan = [];
  let toRemoveBan = [];
  await fetch(`${process.env.DASHBOARD}/getStats`).then(async (statsRes) => {
    const stats = await statsRes.json();
    const botGuildsArray = await guild.find();
    botGuildsArray.forEach(async (x) => {
      await fetch(`${process.env.DASHBOARD}/getGuild/${x.id}`)
        .then(async (res) => await res.json())
        .then(async (guild) => {
          if (await guild) {
            guilds.push(await guild);
          }
          i++;
          if (!guild?.banned) {
            toAddBan.push({
              id: guild.id,
              name: guild.name,
            });
          } else {
            toRemoveBan.push({
              id: guild.id,
              name: guild.name,
            });
          }
          if (i == Number(botGuildsArray.length)) {
            res.render("admin-panel", {
              servers: guilds,
              stats: stats,
              toRemoveBan: toRemoveBan,
              toAddBan: toAddBan,
              isAdmin: config.admin.includes(res.locals.user.id),
            });
          }
        });
    });
  });
});

router.get("/admin-manage/:id", validateAdminUser, async (req, res) => {
  let guilds = [];
  let i = 0;
  await fetch(`${process.env.DASHBOARD}/getStats`).then(async (statsRes) => {
    const stats = await statsRes.json();
    const botGuildsArray = await guild.find();
    botGuildsArray.forEach(async x => {
      await fetch(`${process.env.DASHBOARD}/getGuild/${x.id}`)
        .then(async (res) => await res.json())
        .then(async (guild) => {
          if (guild) {
            guilds.push(guild);
          }
          i++;
          if (i == Number(botGuildsArray.length)) {
            res.render("admin-panel-server-dashboard", {
              servers: guilds,
              stats: stats,
              isAdmin: config.admin.includes(res.locals.user.id),
              guild: await guilds.find((x) => x.id == req.params.id),
            });
          }
        });
    });
  });
});

router.get("/admin-manage/:id/edit", validateAdminUser, async (req, res) => {
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
      short_description,
      votes,
      premium,
      badge
    } = req.query;
    const savedGuild = await guild.findById(id)
    if(!savedGuild) return res.render("404");
    if (description)
      description.length < 250
        ? (savedGuild.description = description)
        : (savedGuild.description = description.slice(0, 250));
    if (short_description)
      short_description.length < 50
        ? (savedGuild.short_description = short_description)
        : (savedGuild.short_description = short_description.slice(0, 50));
    if (votes) savedGuild.votes = Number(votes);
    if (status) savedGuild.status = true;
    if (!status) savedGuild.status = false;
    if (premium) savedGuild.isPremium = true;
    if (!premium) savedGuild.isPremium = false;
    if (badge) savedGuild.badge = badge
    if (backgroundColor) savedGuild.premiumData.backgroundColor = backgroundColor.toString();
    if (fontColorMain) savedGuild.premiumData.fontColorMain = fontColorMain.toString();
    if (fontColorSecond) savedGuild.premiumData.fontColorSecond = fontColorSecond.toString();
    if (buttonColor) savedGuild.premiumData.buttonColor = buttonColor.toString();
    if (directUrl) savedGuild.premiumData.directUrl = directUrl.toString();
    if (badgeColor) savedGuild.premiumData.badgeColor = badgeColor.toString();
    await guild.findByIdAndUpdate(id, savedGuild);

    res.redirect(`/admin-manage/${id}`);
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

router.get("/admin-manage/:id/delete", validateAdminUser, async (req, res) => {
  try {
    const { id } = req.params;
    await guild.findByIdAndRemove(id);
    await bot.guilds.cache.get(id)?.leave();

    res.redirect(`/admin`);
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

router.get("/admin/ban", validateAdminUser, async (req, res) => {
  try {
    const { id } = req.query;
    const savedGuild = await guild.findById(id)
    if (savedGuild.banned) savedGuild.banned = false;
    else savedGuild.banned = true;
    await savedGuild.save();
    res.redirect(`/admin`);
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

module.exports = router;