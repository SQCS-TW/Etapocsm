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
    release_slCmd(bot);

    recurLoadCogs('./src/cogs/');
    console.log('Cogs loaded!');
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

function release_slCmd(bot) {
    working_guild_id = '790978307235512360';
    working_guild = bot.guilds.cache.get(working_guild_id);
    let commands = working_guild.commands;
    commands.set([]);
}

bot.login(process.env.BOT_TOKEN);

module.exports = {
    bot
}
