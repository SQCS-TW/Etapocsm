"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const bot_1 = require("./bot");
const discord_js_1 = require("discord.js");
const shortcut_1 = require("./entities/shortcut");
const reglist_1 = require("./core/reglist");
require('events').EventEmitter.defaultMaxListeners = 30;
let bot;
async function main() {
    await shortcut_1.db.connectMongoDB();
    const allIntents = new discord_js_1.Intents(32767);
    bot = new bot_1.Etapocsm({
        intents: allIntents
    });
    await bot.login(process.env.BOT_TOKEN);
}
process.on('uncaughtException', async (err) => {
    reglist_1.critical_logger.error({
        message: err.message,
        metadata: {
            error: err,
            stack: err.stack
        }
    });
});
main();
