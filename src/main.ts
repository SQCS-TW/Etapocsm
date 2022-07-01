require('dotenv').config();

import { Etapocsm } from './bot';
import { Intents } from 'discord.js';
import { db } from './entities/shortcut';
import { logger } from './core/reglist';


let bot: Etapocsm;
async function main() {
    await db.connectMongoDB();

    const allIntents = new Intents(32767);
    bot = new Etapocsm({
        intents: allIntents
    });

    await bot.login(process.env.BOT_TOKEN);
}

// prevent break down
process.on('uncaughtException', async (data) => {
    console.log(data);
    // logger.error(data.stack);
});

main();
