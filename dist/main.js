"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const bot_1 = require("./bot");
const discord_js_1 = require("discord.js");
const shortcut_1 = require("./entities/shortcut");
const reglist_1 = require("./core/reglist");
let bot;
async function main() {
    await shortcut_1.db.connectMongoDB();
    const allIntents = new discord_js_1.Intents(32767);
    bot = new bot_1.Etapocsm({
        intents: allIntents
    });
    await bot.login(process.env.BOT_TOKEN);
}
// prevent break down
process.on('uncaughtException', async (data) => {
    reglist_1.logger.error(data);
});
main();
