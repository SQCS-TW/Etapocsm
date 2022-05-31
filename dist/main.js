"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Etapocsm = void 0;
require('dotenv').config();
const bot_1 = require("./bot");
Object.defineProperty(exports, "Etapocsm", { enumerable: true, get: function () { return bot_1.Etapocsm; } });
const discord_js_1 = require("discord.js");
const bot = new bot_1.Etapocsm({
    intents: [
        discord_js_1.Intents.FLAGS.GUILDS,
        discord_js_1.Intents.FLAGS.GUILD_MESSAGES
    ]
});
bot.login(process.env.BOT_TOKEN);
