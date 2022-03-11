import { AVAIL_CADRE_CHOICES } from './constants/cadre';
import { Constants, Client, CommandInteraction, ApplicationCommandData } from 'discord.js';
import { CogExtension, WorkingGuildConfig } from '../../core/cog_config';
import { bot } from '../../index';
import { interactionChecker } from './verify';

class Cadre extends CogExtension {
    constructor(bot: Client) {
        super(bot);
    };

    slCmdRegister() {
        const cmd_register_list: Array<ApplicationCommandData> = [
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
                        choices: AVAIL_CADRE_CHOICES
                    }
                ]
            }
        ];

        (new WorkingGuildConfig(this.bot)).slCmdCreater(cmd_register_list);
    };

    async slCmdHandler(interaction) {
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

                // the id of dc_role: "role-token"
                const role_token_id = '791680285464199198';

                if (!interaction.member.roles.cache.some(role => role.id === role_token_id)) {
                    await interaction.editReply({
                        content: ':x:**【請求拒絕】**你沒有 `role-token` 身分組呦，詳情請洽總召。',
                        ephemeral: true
                    });
                    return;
                };
                
                // the id of the role that the user applies for
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


let Cadre_act: Cadre;

function promoter(bot: Client) {
    Cadre_act = new Cadre(bot);
    //Cadre_act.slCmdRegister();
};

bot.on('interactionCreate', async (interaction) => {
    if (!interactionChecker(interaction)) return;

    await bot.interactionAllocater({
        interaction: interaction,
        slCmdHandler: [
            Cadre_act.slCmdHandler
        ]
    });
});

module.exports = {
    promoter
};
