const { avail_cadre_choices } = require('../../core/cadre_config.js');
const { Constants } = require('discord.js');
const { cogExtension, workingGuildConfig } = require('../../core/cog_config.js');
const { bot } = require('../../index.js');
const { slCmdChecker } = require('./verify.js');

class Cadre extends cogExtension {
    slCmdRegister() {
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
        ];

        (new workingGuildConfig(this.bot)).slCmdCreater(cmd_register_list);
    };

    async slCmdHandler(interaction) {
        if (!slCmdChecker(interaction)) return;
        if (!this.in_use) return;

        switch (interaction.commandName) {
            case 'ping': {
                await interaction.reply({
                    content: 'pong!',
                    ephemeral: false
                });
                break;
            };

            case 'get_cadre_role': {
                await interaction.deferReply();
                const role_token_id = '791680285464199198';

                if (!interaction.member.roles.cache.some(role => role.id === role_token_id)) {
                    await interaction.editReply({
                        content: ':x:**【請求拒絕】**你沒有 `role-token` 身分組呦，詳情請洽總召。',
                        ephemeral: true
                    });
                    return;
                };

                const role_id = interaction.options.getString('role');

                interaction.member.roles.add(role_id);
                interaction.member.roles.remove(role_token_id);

                await interaction.editReply({
                    content: ':white_check_mark:**【請求接受】**幹部身分組已給予，請察收！',
                    ephemeral: true
                });
                break;
            };
        };
    };
};


let Cadre_act;

function promoter(bot) {
    Cadre_act = new Cadre(bot);
    Cadre_act.slCmdRegister();
};

bot.on('interactionCreate', async (interaction) => Cadre_act.slCmdHandler(interaction));

module.exports = {
    promoter
};
