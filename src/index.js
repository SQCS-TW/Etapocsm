require('dotenv').config();

const fs = require('fs')
const { Client, Intents } = require('discord.js');
const bot = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES
    ]
});

bot.on('ready', () => {
    console.log(`${bot.user.username} has logged in!`);

    recurLoadCogs('./src/cogs/');
});

function recurLoadCogs(dir) {
    fs.readdir(dir, (err, files) => {
        files.forEach(file => {
            if (file.endsWith('.js')) {
                const { setup } = require(`./${dir.substring(6)}${file}`);
                if (setup) setup(bot);
            } else if (file.indexOf('.') === -1) {
                recurLoadCogs(`${dir}${file}/`);
            }
        });
    });
}

bot.login(process.env.BOT_TOKEN);

module.exports = {
    bot
}