const express = require('express')
const fetch = require('node-fetch')
const guilds = require('../data/guilds')
const bot = require('../bot').bot
const guild = require('../data/models/guild');
const router = express.Router()

router.get('/getStats', async (res, req) => {
    let users = 0
    bot.guilds.cache.forEach(x => users += x.memberCount)
    req.json({
        "guilds": bot.guilds.cache.size,
        "users": users,
    })
})

router.get('/getGuilds', async (res, req) => {
    let guilds = []
    const botGuildsArray = await guild.find({ status: true, banned: false })
    let i = 0
    botGuildsArray.forEach(async (x) => {
        await fetch(`${process.env.DASHBOARD}/getGuild/${x.id}`)
            .then(async res => await res.json())
            .then(async guild => {
                if(guild) {
                    guilds.push(guild);
                  }
                i++
                if (i == Number(botGuildsArray.length)) {
                    req.json(guilds)
                }
            });
    })
})

router.get('/getUserGuilds/:id', async (res, req) => {
    const id = res.params.id
    let guilds = []
    let i = 0
    const botGuildsArray = bot.guilds.cache.array()
    botGuildsArray.forEach(async (x, index) => {
        i++
        if (x.members.cache.has(id)) {
            guilds.push(x.id)
            if (i == Number(botGuildsArray.length)) {
                req.json(guilds)
            }
        } else if (i == Number(botGuildsArray.length)) {
            req.json(guilds)
        }
    })
})

router.get('/getGuild/:id', async (res, req) => {
    const id = res.params.id
    const guildDiscord = bot.guilds.cache.get(id)
    if((await guild.findById(id))?.banned) return req.json({
        banned: true,
        id: id,
        name: guildDiscord.name || null
    })
    if (guildDiscord) {
        const guildDB = await guilds.get(id)
        const guild = {
            icon: guildDiscord.iconURL({ dynamic: true }) || null,
            name: guildDiscord.name,
            nameAcronym: guildDiscord.nameAcronym || null,
            invite: process.env.DASHBOARD_REDIRECT + '/s/' + guildDB.uniqueId + '/join',
            id: id,
            badge: guildDB.badge == " " ? null : guildDB.badge,
            status: guildDB.status,
            uniqueId: guildDB.uniqueId,
            description: guildDB.description,
            short_description: guildDB.short_description,
            isPremium: guildDB.isPremium,
            premiumData: guildDB.premiumData,
            votes: guildDB.votes,
            banned: false
        }
        req.json(guild)
    } else {
        await guild.findByIdAndRemove(id)
        req.json(null)
    }

})

module.exports = router