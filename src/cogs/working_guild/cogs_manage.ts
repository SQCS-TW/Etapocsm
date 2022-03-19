import { CogExtension, WorkingGuildConfig } from '../../core/cog_config';
import { bot, Etapocsm } from '../../../main';
import { interactionChecker } from './verify';
import {
    CommandInteraction,
    ApplicationCommandData,
    Constants
} from 'discord.js';

class CogsManager extends CogExtension {
    constructor(bot: Etapocsm) {
        super(bot);
    }

    public async slCmdRegister() {
        const cmd_register_list: Array<ApplicationCommandData> = [
            {
                name: 'list_cogs',
                description: '列出所有插件'
            },
            {
                name: 'reload_cog',
                description: '重新載入插件',
                options: [
                    {
                        name: 'cog_name',
                        description: '重新載入的插件名稱',
                        type: Constants.ApplicationCommandOptionTypes.STRING,
                        required: true
                    }
                ]
            }
        ];

        (new WorkingGuildConfig(this.bot)).slCmdCreater(cmd_register_list);
    }

    async slCmdHandler(interaction: CommandInteraction) {
        if (!this.in_use) return;

        switch (interaction.commandName) {
            case 'list_cogs': {
                if (!this.checkPerm(interaction, 'ADMINISTRATOR')) return;
                await interaction.deferReply({ ephemeral: true });

                const cogs_list = [...this.bot.cogs_list.keys()];
                await interaction.editReply({
                    content: cogs_list.join(', ')
                });
                break;
            }

            case 'reload_cog': {
                if (!this.checkPerm(interaction, 'ADMINISTRATOR')) return;
                await interaction.deferReply({ ephemeral: true });

                const cogs_list = [...this.bot.cogs_list.keys()];
                const cog_name = interaction.options.getString('cog_name');

                if (cogs_list.indexOf(cog_name) === -1) {
                    await interaction.editReply({
                        content: ':x:**【插件名稱錯誤】**找不到這個插件！'
                    })
                    return;
                }

                const reload_result = await this.bot.reloadCog(cog_name);
                if (reload_result) {
                    await interaction.editReply({
                        content: ':white_check_mark:**【重載完畢】**'
                    });
                } else {
                    await interaction.editReply({
                        content: ':x:**【重載錯誤】**'
                    });
                }
                break;
            }
        }
    }
}

let CogsManager_act: CogsManager;

async function promoter(bot: Etapocsm): Promise<string> {
    const cog_name = 'cogs_manager';
    CogsManager_act = new CogsManager(bot);
    //await CogsManager_act.slCmdRegister();
    return cog_name;
}

bot.on('interactionCreate', async (interaction) => {
    if (!interactionChecker(interaction)) return;

    await bot.interactionAllocater({
        interaction: interaction,
        interaction_managers: [
            CogsManager_act
        ]
    });
});


export {
    promoter
}