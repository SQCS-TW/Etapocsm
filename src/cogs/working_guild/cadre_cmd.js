const { avail_cadre_choices } = require('../../core/cadre_config.js');
const { Constants } = require('discord.js');
const { CogExtension } = require('../../core/cog_config.js');
const { bot } = require('../../index.js');
const { slCmdChecker } = require('./basic_verify.js');

class Cadre extends CogExtension {
    slCmdRegister = () => {
        let commands = this.working_guild.commands;

        const cmd_register_list = [
            {
                name: 'ping',
                description: 'Hit the bot!'
            },
            {
                name: 'get_cadre_role',
                description: '獲取幹部身分組',
                options: [
                    {
                        name: 'role',
                        description: '你要獲取的幹部身分組',
                        type: Constants.ApplicationCommandOptionTypes.STRING,
                        required: true,
                        choices: avail_cadre_choices
                    }
                ]
            }
        ]

        for (const cmd of cmd_register_list) commands.create(cmd)
    };

    slCmdHandler = async (interaction) => {
        if (!slCmdChecker(interaction)) {
            await interaction.reply(this.check_failed_warning);
            return;
        }
        if (!this.in_use) {
            await interaction.reply(this.not_in_use_warning);
            return;
        }

        if (interaction.commandName === 'ping') {
            await interaction.reply({
                content: 'pong!',
                ephemeral: false
            });
        }

        if (interaction.commandName === 'get_cadre_role') {
            const role_token_id = '791680285464199198';

            if (!interaction.member.roles.cache.some(role => role.id === role_token_id)) {
                await interaction.reply({
                    content: '請求拒絕，你沒有 `role-token` 身分組呦，詳情請洽總召。',
                    ephemeral: true
                });
                return;
            }

            const role_id = interaction.options.getString('role');

            interaction.member.roles.add(role_id);
            interaction.member.roles.remove(role_token_id);

            await interaction.reply({
                content: '幹部身分組已給予，請察收！',
                ephemeral: true
            })
        };
    };
};

let Cadre_act;

function setup(bot) {
    Cadre_act = new Cadre(bot);
    Cadre_act.slCmdRegister();
}

bot.on('interactionCreate', async (interaction) => {
    Cadre_act.slCmdHandler(interaction)
});

module.exports = {
    setup
}
