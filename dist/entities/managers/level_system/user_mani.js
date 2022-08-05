"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserManiManager = void 0;
const shortcut_1 = require("../../shortcut");
const components_1 = require("./components");
class UserManiManager extends shortcut_1.core.BaseManager {
    constructor(f_platform) {
        super();
        this.f_platform = f_platform;
        this.setupListener();
        this.slcmd_register_options = {
            guild_id: [shortcut_1.core.GuildId.MAIN, shortcut_1.core.GuildId.CADRE],
            cmd_list: components_1.USER_MANI_SLCMD_REGISTER_LIST
        };
    }
    setupListener() {
        this.f_platform.f_bot.on('interactionCreate', async (interaction) => {
            if (!interaction.inGuild())
                return;
            if (!(this.checkPerm(interaction, 'ADMINISTRATOR')))
                return;
            if (interaction.isCommand())
                await this.slcmdHandler(interaction);
        });
    }
    async slcmdHandler(interaction) {
        switch (interaction.commandName) {
            case 'mani-exp-multiplier': {
                await interaction.deferReply();
                const user_id = interaction.options.getString('id');
                const new_exp_multiplier = interaction.options.getNumber('new-multiplier').toFixed(1);
                const user_lvl_main_acc = await (await this.f_platform.mainlvl_acc_op.cursor).findOne({ user_id: user_id });
                if (!user_lvl_main_acc)
                    return await interaction.editReply('找無用戶等級資料');
                const origin_exp_multiplier = user_lvl_main_acc.exp_multiplier;
                const update_exp_multiplier = {
                    $set: {
                        exp_multiplier: new_exp_multiplier
                    }
                };
                const update_result = await (await this.f_platform.mainlvl_acc_op.cursor).updateOne({ user_id: user_id }, update_exp_multiplier);
                if (update_result.acknowledged)
                    return await interaction.editReply(`用戶經驗值倍率已修改！（${origin_exp_multiplier} -> ${new_exp_multiplier}）`);
                else
                    return await interaction.editReply('修改錯誤');
            }
        }
    }
}
exports.UserManiManager = UserManiManager;
