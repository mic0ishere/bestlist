const OAuthClient = require('disco-oauth');
const credentials = require('../credentials.json');

const client = new OAuthClient(credentials.bot.id, credentials.bot.secret);
client.setRedirect(`${process.env.DASHBOARD_REDIRECT}/auth`);
client.setScopes('identify', 'guilds');

module.exports = client;