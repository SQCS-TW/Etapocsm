require('dotenv').config();

import { Etapocsm } from './bot';
import { Intents } from 'discord.js';
import { db } from './entities/shortcut';
import { critical_logger } from './core/reglist';

require('events').EventEmitter.defaultMaxListeners = 30;


let bot: Etapocsm;
async function main() {
    await db.connectMongoDB();

    const allIntents = new Intents(32767);
    bot = new Etapocsm({
        intents: allIntents
    });

    await bot.login(process.env.BOT_TOKEN);
}

// function getStackTrace(err) {
//     Error.captureStackTrace(err, getStackTrace);
//     return err;
// }

// prevent break down
process.on('uncaughtException', async (err) => {
    // const refined_err = getStackTrace(err);
    critical_logger.error({
        message: err.message,
        metadata: {
            error: err,
            stack: err.stack
        }
    });
});

main();
