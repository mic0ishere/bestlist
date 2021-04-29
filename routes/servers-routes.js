const express = require('express')
const fetch = require('node-fetch')
const guilds = require('../data/guilds')
const users = require('../data/users');
const bot = require('../bot').bot
const guild = require('../data/models/guild');
const router = express.Router()

router.get('/servers', async (req, res) => {
    await fetch(`${process.env.DASHBOARD}/getGuilds`)
        .then(async res => await res.json())
        .then(async json => {
            res.render('server-list', {
                servers: await json
            })
        });
});

router.get('/s/:id', async (res, req, next) => {
    const id = res.params.id
    const guildDB = await guild.findById(id)
    if (guildDB) req.redirect(`/s/${guildDB.uniqueId}`)
    else next()
})

router.get('/s/:uniqueId', async (res, req) => {
    const uniqueId = res.params.uniqueId.toUpperCase()
    const guildDB = await guilds.getByUniqueId(uniqueId)
    if (!guildDB) return req.render('404')
    if(guildDB.banned) return req.render('server-banned')
    const guildDiscord = bot.guilds.cache.get(guildDB.id)
    if(req.locals.user) {
        const userDB = await users.get(req.locals.user.id)
        req.locals.user.can_vote = !(((Math.round((new Date().getTime()) / 1000) - userDB.voteCooldown) < (12*3600)) && userDB.voteCooldown != 0)
    }
    const guild = {
        icon: guildDiscord.iconURL({ dynamic: true }) || null,
        name: guildDiscord.name,
        nameAcronym: guildDiscord.nameAcronym,
        invite: process.env.DASHBOARD + '/s/' + guildDB.uniqueId + '/join',
        id: guildDB.id,
        status: guildDB.status,
        uniqueId: uniqueId,
        badge: guildDB.badge == " " ? null : guildDB.badge,
        description: guildDB.description,
        short_description: guildDB.short_description,
        premium: guildDB.isPremium ? guildDB.premiumData : false,
        votes: guildDB.votes
    }
    if (guildDB.status) {
        req.render('server-page', {
            server: guild
        })
    } else req.render('404')
})

router.get('/s/:uniqueId/join', async (res, req) => {
    const uniqueId = res.params.uniqueId
    const guildDB = await guilds.getByUniqueId(uniqueId)
    if (!guildDB) return req.render('404')
    if(guildDB.banned) return req.render('server-banned')
    const guildDiscord = bot.guilds.cache.get(guildDB.id)
    req.redirect('https://discord.gg/' + (await (guildDiscord.channels.cache.find(x => x.type == 'text')).createInvite({
        maxAge: 0
    })).code)
})

router.get('/s/:uniqueId/vote', async (res, req) => {
    const uniqueId = res.params.uniqueId
    if (!req.locals.user) return req.redirect('/s/' + uniqueId)
    const guildDB = await guilds.getByUniqueId(uniqueId)
    if (!guildDB) return req.render('404')
    if(guildDB.banned) return req.render('server-banned')
    const userDB = await users.get(req.locals.user.id)
    const currentTime = Math.round((new Date().getTime()) / 1000)
    if (((currentTime - userDB.voteCooldown) < (12*3600)) && userDB.voteCooldown != 0) return req.redirect('/s/' + uniqueId)
    guildDB.votes++
    userDB.voteCooldown = currentTime
    await guildDB.save()
    await userDB.save()
    return req.render('server-page-vote', {
        id: guildDB.id,
        name: bot.guilds.cache.get(guildDB.id).name
    })

})


module.exports = router