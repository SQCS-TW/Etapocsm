import { AVAIL_CADRE_CHOICES } from './constants/cadre';
import { Constants, ApplicationCommandData, CommandInteraction, GuildMemberRoleManager } from 'discord.js';
import { CogExtension, WorkingGuildConfig } from '../../core/cog_config';
import { bot, Etapocsm } from '../../../main';
import { interactionChecker } from './verify';

class Cadre extends CogExtension {
    constructor(bot: Etapocsm) {
        super(bot);
    }

    public async slCmdRegister() {
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
    }

    public async slCmdHandler(interaction: CommandInteraction) {
        if (!this.in_use) return;

        switch (interaction.commandName) {
            case 'ping': {
                console.log('activated!', Date.now());
                await interaction.reply({
                    content: 'this is pong!',
                    ephemeral: false
                });
                break;
            }

            case 'get_cadre_role': {
                await interaction.deferReply();

                // the id of dc_role: "role-token"
                const role_token_id = '791680285464199198';

                if (interaction.member.roles instanceof GuildMemberRoleManager && !interaction.member.roles.cache.some(role => role.id === role_token_id)) {
                    await interaction.editReply({
                        content: ':x:**【請求拒絕】**你沒有 `role-token` 身分組呦，詳情請洽總召。'
                    });
                    return;
                }

                // the id of the role that the user applies for
                const role_id = interaction.options.getString('role');

                if (interaction.member.roles instanceof GuildMemberRoleManager) {
                    interaction.member.roles.add(role_id);
                    interaction.member.roles.remove(role_token_id);
                }

                await interaction.editReply({
                    content: ':white_check_mark:**【請求接受】**幹部身分組已給予，請察收！'
                });
                break;
            }
        }
    }
}


let Cadre_act: Cadre;

async function promoter(bot: Etapocsm) {
    const cog_name = 'cadre_cmd';
    Cadre_act = new Cadre(bot);
    //Cadre_act.slCmdRegister();
    return cog_name;
}

bot.on('interactionCreate', async (interaction) => {
    if (!interactionChecker(interaction)) return;

    await bot.interactionAllocater({
        interaction: interaction,
        interaction_managers: [
            Cadre_act
        ]
    });
});

module.exports = {
    promoter
};
