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

    let commands = guild.commands;

    commands.create({
        name: 'ping',
        description: 'Hit the bot!'
    });

    commands.create({
        name: 'get_cadre_role',
        description: '獲取幹部身分組',
        options: [
            {
                name: 'role',
                description: '你要獲取的幹部身分組',
                type: Constants.ApplicationCommandOptionTypes.STRING,
                required: true,
                choices: [
                    {
                        name: '副召',
                        value: '790978959411904532'
                    },
                    {
                        name: '學術',
                        value: '828317945796231178'
                    },
                    {
                        name: '網管',
                        value: '790979485779886112'
                    },
                    {
                        name: '公關',
                        value: '790979506906726471'
                    },
                    {
                        name: '美宣',
                        value: '790979546785775626'
                    },
                    {
                        name: '議程',
                        value: '790979524090658857'
                    }
                ]
            }
        ]
    });
});

bot.on('interactionCreate', async (interaction) => {
    const working_guild_id = '790978307235512360';
    if (interaction.guildId !== working_guild_id) return;

    if (!interaction.isCommand()) {
        return;
    }

    if (interaction.commandName === 'ping') {
        interaction.reply({
            content: 'pong!',
            ephemeral: false
        });
    }

    if (interaction.commandName === 'get_cadre_role') {
        const role_token_id = '791680285464199198';

        if (!interaction.member.roles.cache.some(role => role.id === role_token_id)) {
            interaction.reply({
                content: '請求拒絕，你沒有 `role-token` 身分組呦，詳情請洽總召。',
                ephemeral: true
            });
            return;
        }

        const role_id = interaction.options.getString('role');

        interaction.member.roles.add(role_id);
        interaction.member.roles.remove(role_token_id);

        interaction.reply({
            content: '幹部身分組已給予，請察收！',
            ephemeral: true
        })
    }
});

bot.login(process.env.BOT_TOKEN);
