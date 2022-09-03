"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BountyUserManiManager = void 0;
const user_mani_1 = require("./components/user_mani");
const shortcut_1 = require("../../shortcut");
const fs_1 = __importDefault(require("fs"));
class BountyUserManiManager extends shortcut_1.core.BaseManager {
    constructor(f_platform) {
        super();
        this.f_platform = f_platform;
        this.setupListener();
        this.slcmd_register_options = {
            guild_id: [shortcut_1.core.GuildId.MAIN, shortcut_1.core.GuildId.CADRE],
            cmd_list: user_mani_1.REGISTER_LIST
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
        this.f_platform.f_bot.on('messageCreate', async (msg) => {
            if (msg.member?.permissions?.any('ADMINISTRATOR'))
                await this.messageHandler(msg);
        });
    }
    async messageHandler(msg) {
        if (msg.content === 'e:GENERATE-BOUNTY-POLL-DATA') {
            const poll_requirements = {
                level: {
                    $gte: 3
                }
            };
            const players_data = await (await this.f_platform.mainlvl_acc_op.cursor).find(poll_requirements).sort({ total_exp: -1 }).toArray();
            const poll_data = [];
            for (let i = 0, ordinal_num = 1; i < players_data.length; i++) {
                const player_data = players_data[i];
                const bounty_main_acc = await (await this.f_platform.account_op.cursor).findOne({ user_id: player_data.user_id });
                if (!bounty_main_acc)
                    continue;
                const answered_count = bounty_main_acc.qns_record.answered_qns_count.easy
                    + bounty_main_acc.qns_record.answered_qns_count.medium
                    + bounty_main_acc.qns_record.answered_qns_count.hard;
                if (answered_count === 0)
                    continue;
                if (ordinal_num <= 10) {
                    for (let j = 0; j <= 11 - ordinal_num; j++)
                        poll_data.push(`${player_data.user_id}_${j}`);
                    ordinal_num++;
                }
                else {
                    poll_data.push(`${player_data.user_id}`);
                }
            }
            const buffer_file_path = './buffer/lottery.txt';
            fs_1.default.writeFileSync(buffer_file_path, poll_data.join("\n"));
            await msg.channel.send({
                content: 'fin.',
                files: [buffer_file_path]
            });
            fs_1.default.unlinkSync(buffer_file_path);
        }
    }
    async slcmdHandler(interaction) {
        switch (interaction.commandName) {
            case 'mani-bounty-auth': {
                await interaction.deferReply();
                const user_id = interaction.options.getString('id');
                const new_auth = interaction.options.getBoolean('new-auth');
                const result = await this.f_platform.account_op.setAuth(user_id, new_auth);
                return await interaction.editReply(result.message);
            }
            case 'mani-bounty-status': {
                await interaction.deferReply();
                const user_id = interaction.options.getString('id');
                const new_status = interaction.options.getBoolean('new-status');
                const result = await this.f_platform.ongoing_op.setStatus(user_id, new_status);
                return await interaction.editReply(result.message);
            }
            case 'mani-bounty-stamina': {
                await interaction.deferReply();
                const user_id = interaction.options.getString('id');
                const type = interaction.options.getString('type');
                const delta_stamina = interaction.options.getInteger('delta');
                const user_ongoing_data = await (await this.f_platform.ongoing_op.cursor).findOne({ user_id: user_id });
                if (!user_ongoing_data)
                    return await interaction.editReply('找無此用戶的遊玩中資料');
                const origin_stamina = user_ongoing_data.stamina[type];
                const update_stamina = {
                    $set: {
                        [`stamina.${type}`]: delta_stamina
                    }
                };
                const update_result = await (await this.f_platform.ongoing_op.cursor).updateOne({ user_id: user_id }, update_stamina);
                if (update_result.acknowledged)
                    return await interaction.editReply(`修改成功，用戶現在有 ${origin_stamina + delta_stamina} 點 ${type} 體力`);
                else
                    return await interaction.editReply('修改失敗');
            }
        }
    }
}
exports.BountyUserManiManager = BountyUserManiManager;
