const credentials = require("../credentials.json");
const express = require("express");
const authClient = require("../modules/auth-client");
const sessions = require("../modules/sessions");
const fetch = require("node-fetch");
const guild = require("../data/models/guild");

const router = express.Router();

async function getRandom(arr, n) {
  let result = new Array(n),
    len = arr.length,
    taken = new Array(len);
  if (n > len) return await getRandom(arr, n - 1);
  while (n--) {
    var x = Math.floor(Math.random() * len);
    result[n] = arr[x in taken ? taken[x] : x];
    taken[x] = --len in taken ? taken[len] : len;
  }
  return result;
}

router.get("/", async (req, res) => {
  const guilds = [];
  const randomPremiumGuildsArray = await getRandom(
    await guild.find({ isPremium: true }),
    3
  );
  await Promise.all(
    await randomPremiumGuildsArray.map(async (x) => {
      const fetchedGuild = await fetch(
        `${process.env.DASHBOARD}/getGuild/${x.id}`
      ).then(async (res) => await res.json());
      console.log(fetchedGuild);
      if (!fetchedGuild?.banned) guilds.push(fetchedGuild);
    })
  );
  fetch(`${process.env.DASHBOARD}/getStats`).then(async (statsRes) => {
    const stats = await statsRes.json();
    res.render("index", {
      stats: stats,
      servers: guilds,
    });
  });
  // botGuildsArray.forEach((x) => {
  //   fetch(`${process.env.DASHBOARD}/getGuild/${x.id}`)
  //     .then(async (res) => await res.json())
  //     .then(async (guild) => {
  //       if (!guild?.banned) {
  //         guilds.push(guild);
  //       }
  //       i++;
  //       if (i == Number(botGuildsArray.length)) {
  //         fetch(`${process.env.DASHBOARD}/getStats`).then(async (statsRes) => {
  //           const stats = await statsRes.json();
  //           res.render("index", {
  //             stats: stats,
  //             servers: guilds,
  //           });
  //         });
  //       }
  //     });
  // });
});

router.get("/invite", (req, res) =>
  res.redirect(
    `https://discord.com/oauth2/authorize?client_id=${credentials.bot.id}&scope=bot%20guilds%20identify&permissions=11313&response_type=code&redirect_uri=${process.env.DASHBOARD_REDIRECT}/auth`
    // res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${credentials.bot.id}&redirect_uri=${process.env.DASHBOARD_REDIRECT}/auth-guild&response_type=code&scope=bot`));
  )
);

router.get("/support", (req, res) =>
  res.redirect(`https://discord.gg/fxdfgUBwnC`)
);

router.get("/login", (req, res) =>
  res.redirect(
    `https://discord.com/api/oauth2/authorize?client_id=${credentials.bot.id}&redirect_uri=${process.env.DASHBOARD_REDIRECT}/auth&response_type=code&scope=identify guilds&prompt=none`
  )
);

router.get("/auth-guild", async (req, res) => {
  try {
    const key = res.cookies.get("key");
    await sessions.update(key);
  } finally {
    res.redirect("/dashboard");
  }
});

router.get("/auth", async (req, res) => {
  try {
    const code = req.query.code;
    const key = await authClient.getAccess(code);

    res.cookies.set("key", key);
    res.redirect("/dashboard");
  } catch {
    res.redirect("/");
  }
});

router.get("/logout", (req, res) => {
  res.cookies.set("key", "");

  res.redirect("/");
});

module.exports = router;
