require('dotenv').config();

const fs = require('fs')
const { Client, Intents } = require('discord.js');
const { MainGuildConfig, WorkingGuildConfig } = require('./core/cog_config.js');


const bot = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES
    ]
});

bot.on('ready', async () => {
    console.log(`${bot.user.username} has logged in!`);

    //await resetSlCmd(bot);
    //console.log('Cogs reseted!');

    // directly transforming recursive func: "recurLoadCogs" into async func 
    // will cause weird problems
    await new Promise(resolve => {
        recurLoadCogs('./src/cogs/');
        resolve('ok!');
    });
    console.log('Cogs loaded!');
});

function recurLoadCogs(dir) {
    // load "cogs" files with func: "promoter" under ./cogs/
    fs.readdir(dir, (err, files) => {
        files.forEach(file => {
            if (file.endsWith('.js')) {
                const { promoter } = require(`./${dir.substring(6)}${file}`);
                if (promoter) promoter(bot);
            } else if (file.indexOf('.') === -1) {
                recurLoadCogs(`${dir}${file}/`);
            }
        });
    });
};

async function resetSlCmd(bot) {
    // clear registered slash commands in every guild
    await (new MainGuildConfig(bot)).slCmdReset();
    await (new WorkingGuildConfig(bot)).slCmdReset();
};

bot.login(process.env.BOT_TOKEN);

module.exports = {
    bot
};
