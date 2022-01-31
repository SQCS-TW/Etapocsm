require('dotenv').config();

const fs = require('fs')
const { Client, Intents } = require('discord.js');
const { mainGuildConfig, workingGuildConfig } = require('./core/cog_config.js')

const bot = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES
    ]
});

bot.on('ready', () => {
    console.log(`${bot.user.username} has logged in!`);
    resetSlCmd(bot);

    recurLoadCogs('./src/cogs/');
    console.log('Cogs loaded!');
});

function recurLoadCogs(dir) {
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
}

function resetSlCmd(bot) {
    (new mainGuildConfig(bot)).slCmdReset();
    (new workingGuildConfig(bot)).slCmdReset();
}

bot.login(process.env.BOT_TOKEN);

module.exports = {
    bot
}
