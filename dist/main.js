"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const bot_1 = require("./bot");
const discord_js_1 = require("discord.js");
const allIntents = new discord_js_1.Intents(32767);
const bot = new bot_1.Etapocsm({
    intents: allIntents
});
// prevent break down
process.on('uncaughtException', async (data) => {
    console.log(data);
});
bot.login(process.env.BOT_TOKEN);
