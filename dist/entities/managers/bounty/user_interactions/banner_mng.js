"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BountyAccountManager = void 0;
const discord_js_1 = require("discord.js");
const shortcut_1 = require("../../../shortcut");
class BountyAccountManager extends shortcut_1.core.BaseManager {
    constructor(f_platform) {
        super(f_platform);
        this.account_op = new shortcut_1.core.BountyUserAccountOperator();
        this.ongoing_op = new shortcut_1.core.BountyUserOngoingInfoOperator();
        this.mainlvl_acc_op = new shortcut_1.core.MainLevelAccountOperator();
        this.cache = new shortcut_1.db.Redis();
        this.setupListener();
    }
    setupListener() {
        this.f_platform.f_bot.on('ready', async () => {
            await this.cache.connect();
        });
        this.f_platform.f_bot.on('interactionCreate', async (interaction) => {
            if (interaction.isButton())
                await this.buttonHandler(interaction);
        });
    }
    async buttonHandler(interaction) {
        switch (interaction.customId) {
            case 'create-main-bounty-account': {
                await interaction.deferReply({ ephemeral: true });
                const exist_result = await this.account_op.checkDataExistence({ user_id: interaction.user.id });
                if (exist_result.status === shortcut_1.db.StatusCode.DATA_FOUND)
                    return await interaction.editReply('你已經建立過懸賞區主帳號了！');
                const create_result = await this.account_op.createDefaultData({ user_id: interaction.user.id });
                if (create_result.status === shortcut_1.db.StatusCode.WRITE_DATA_ERROR)
                    return await interaction.editReply('建立帳號時發生錯誤了！');
                else {
                    await this.mainlvl_acc_op.createUserMainAccount(interaction.user.id);
                    return await interaction.editReply('帳號建立成功！');
                }
            }
            case 'check-account-data': {
                await interaction.deferReply({ ephemeral: true });
                const exist_result = await this.account_op.checkDataExistence({ user_id: interaction.user.id });
                if (exist_result.status === shortcut_1.db.StatusCode.DATA_NOT_FOUND)
                    return await interaction.editReply('你還沒建立過懸賞區主帳號！');
                const user_acc_data = await this.getOrCacheUserAccData(interaction.user.id);
                const user_acc_embed = new discord_js_1.MessageEmbed()
                    .setTitle(`你（**${interaction.user.username}**）的懸賞區帳號資訊`)
                    .addField('🕑 帳號創建日期', shortcut_1.core.discord.getRelativeTimestamp(user_acc_data.create_date), true)
                    .addField('🔰 遊玩權限', `${user_acc_data.auth}`, true)
                    .addField('✨ 經驗值', `**${user_acc_data.exp}** 點`, true)
                    .setColor('#ffffff');
                const ongoing_info = await (await this.ongoing_op.cursor).findOne({ user_id: interaction.user.id });
                if (ongoing_info) {
                    user_acc_embed
                        .addField('💪 普通體力', `${ongoing_info.stamina.regular} 格`, true)
                        .addField('⚡ 額外體力', `${ongoing_info.stamina.extra} 格`, true);
                }
                return await interaction.editReply({
                    embeds: [user_acc_embed]
                });
            }
            case 'check-personal-record': {
                await interaction.deferReply({ ephemeral: true });
                const exist_result = await this.ongoing_op.checkDataExistence({ user_id: interaction.user.id });
                if (exist_result.status === shortcut_1.db.StatusCode.DATA_NOT_FOUND)
                    return await interaction.editReply('你還沒開啟過懸賞區！');
                const user_acc_data = await this.getOrCacheUserAccData(interaction.user.id);
                const qns_count = user_acc_data.qns_record.answered_qns_count;
                const crt_count = user_acc_data.qns_record.correct_qns_count;
                const user_record_embed = new discord_js_1.MessageEmbed()
                    .setTitle(`你（**${interaction.user.username}**）的懸賞區遊玩紀錄`)
                    .addField('📜 回答題數', `🟩：**${qns_count.easy}** 次\n🟧：**${qns_count.medium}** 次\n🟥：**${qns_count.hard}** 次\n\u200b`, true)
                    .addField('✅ 答對題數', `🟩：**${crt_count.easy}** 次\n🟧：**${crt_count.medium}** 次\n🟥：**${crt_count.hard}** 次\n\u200b`, true)
                    .addField('🗂️ 單一難度問題串破關總數', `**${user_acc_data.personal_record.thread_cleared_count}** 次`)
                    .addField('🗃️ 問題串全破關總數', `**${user_acc_data.personal_record.thread_all_cleared_count}** 次`)
                    .addField('💪 獲得額外體力的次數', `**${user_acc_data.personal_record.extra_stamina_gained_count}** 次`)
                    .setColor('#ffffff');
                return await interaction.editReply({
                    embeds: [user_record_embed]
                });
            }
        }
    }
    async getOrCacheUserAccData(user_id) {
        const key = `bounty-acc-info?id=${user_id}`;
        const acc_cache_data = await this.cache.client.GET(key);
        if (acc_cache_data !== null)
            return JSON.parse(acc_cache_data);
        const user_acc_data = await (await this.account_op.cursor).findOne({ user_id: user_id });
        await this.cache.client.SETEX(key, 60, JSON.stringify(user_acc_data));
        return user_acc_data;
    }
}
exports.BountyAccountManager = BountyAccountManager;
