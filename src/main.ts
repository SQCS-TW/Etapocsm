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

function getStackTrace(err) {
    Error.captureStackTrace(err, getStackTrace);
    return err;
}

// prevent break down
process.on('uncaughtException', async (err) => {
    const refined_err = getStackTrace(err);
    logger.error(`${refined_err.stack} ${JSON.stringify(refined_err, null, 4)}`);
});

main();
