import { CommandInteraction } from 'discord.js';
import { LvlSysPlatform } from '../../platforms/level_system';
import { core } from '../../shortcut';
import { USER_MANI_SLCMD_REGISTER_LIST } from './components';


export class UserManiManager extends core.BaseManager {
    public f_platform: LvlSysPlatform;

    constructor(f_platform: LvlSysPlatform) {
        super();
        this.f_platform = f_platform;

        this.setupListener();

        this.slcmd_register_options = {
            guild_id: [core.GuildId.MAIN, core.GuildId.CADRE],
            cmd_list: USER_MANI_SLCMD_REGISTER_LIST
        };
    }

    private setupListener() {
        this.f_platform.f_bot.on('interactionCreate', async (interaction) => {
            if (!interaction.inGuild()) return;
            if (!(this.checkPerm(interaction, 'ADMINISTRATOR'))) return;
            if (interaction.isCommand()) await this.slcmdHandler(interaction);
        });
    }

    private async slcmdHandler(interaction: CommandInteraction) {
        switch (interaction.commandName) {
            case 'mani-exp-multiplier': {
                await interaction.deferReply();
                const user_id = interaction.options.getString('id');
                const new_exp_multiplier = interaction.options.getNumber('new-multiplier').toFixed(1);

                const user_lvl_main_acc = await (await this.f_platform.mainlvl_acc_op.cursor).findOne({ user_id: user_id });
                if (!user_lvl_main_acc) return await interaction.editReply('找無用戶等級資料');

                const origin_exp_multiplier = user_lvl_main_acc?.exp_multiplier ?? 1;

                const update_exp_multiplier = {
                    $set: {
                        exp_multiplier: new_exp_multiplier
                    }
                };
                const update_result = await (await this.f_platform.mainlvl_acc_op.cursor).updateOne({ user_id: user_id }, update_exp_multiplier);
                if (update_result.acknowledged) return await interaction.editReply(`用戶經驗值倍率已修改！（${origin_exp_multiplier} -> ${new_exp_multiplier}）`);
                else return await interaction.editReply('修改錯誤');
            }
        }
    }
}