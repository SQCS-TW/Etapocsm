require('dotenv').config();

const { Client, Intents, Constants } = require('discord.js');
const bot = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES
    ]
});

bot.on('ready', () => {
    console.log(`${bot.user.username} has logged in!`);

    const guildId = '790978307235512360';
    const guild = bot.guilds.cache.get(guildId);

    let commands
    if (guild) {
        commands = guild.commands;
    } else {
        commands = bot.application?.commands;
    }

    commands?.create({
        name: 'ping',
        description: 'Hit the bot!',
    });

    commands?.create({
        name: 'get_cadre_role',
        description: 'get cadre role',
        options: [
            {
                name: 'role',
                description: 'see billboard',
                required: true,
                type: Constants.ApplicationCommandOptionTypes.STRING,
            }
        ],
    })
});

bot.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) {
        return;
    }
    const { commandName, options } = interaction;

    if (commandName === 'ping') {
        interaction.reply({
            content: 'pong!',
            ephemeral: false,
        });
    }
});

bot.on('messageCreate', (message) => {
    if (message.guildId !== '790978307235512360') {
        return;
    }

    if (message.content === '%ping') {
        message.reply({
            content: 'Pong!'
        })
    }
});

bot.login(process.env.BOT_TOKEN);
