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
function getStackTrace(err) {
    Error.captureStackTrace(err, getStackTrace);
    return err;
}
process.on('uncaughtException', async (err) => {
    const refined_err = getStackTrace(err);
    reglist_1.logger.error(`${refined_err.stack} ${JSON.stringify(refined_err, null, 4)}`);
});
main();
