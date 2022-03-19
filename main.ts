require('dotenv').config();

import { Etapocsm } from './src/bot';
import { Intents } from 'discord.js';

const bot = new Etapocsm({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES
    ]
});

bot.login(process.env.BOT_TOKEN);

export {
    bot,
    Etapocsm
};
