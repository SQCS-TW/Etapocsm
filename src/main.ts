require('dotenv').config();

import { Etapocsm } from './bot';
import { Intents } from 'discord.js';

const allIntents = new Intents(32767);
const bot = new Etapocsm({
    intents: allIntents
});

// prevent break down
process.on('uncaughtException', async (data) => {
    console.log(data);
});

bot.login(process.env.BOT_TOKEN);
