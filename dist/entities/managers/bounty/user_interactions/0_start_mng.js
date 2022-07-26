"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StartBountyManager = void 0;
const shortcut_1 = require("../../../shortcut");
const discord_js_1 = require("discord.js");
const components_1 = require("./components");
const utils_1 = require("./utils");
const date_fns_tz_1 = require("date-fns-tz");
class StartBountyManager extends shortcut_1.core.BaseManager {
    constructor(f_platform) {
        super(f_platform);
        this.account_op = new shortcut_1.core.BountyUserAccountOperator();
        this.ongoing_op = new shortcut_1.core.BountyUserOngoingInfoOperator();
        this.start_button_op = new shortcut_1.core.BaseMongoOperator({
            db: 'Bounty',
            coll: 'StartButtonPipeline'
        });
        this.db_cache_operator = new shortcut_1.core.BaseMongoOperator({
            db: 'Bounty',
            coll: 'StorjQnsDBCache'
        });
        this.qns_thread_beauty = new utils_1.QnsThreadBeautifier();
        this.confirm_start_button_op = new shortcut_1.core.BaseMongoOperator({
            db: 'Bounty',
            coll: 'StartButtonPipeline'
        });
        this.end_button_op = new shortcut_1.core.BaseMongoOperator({
            db: 'Bounty',
            coll: 'EndButtonPipeline'
        });
        this.dropdown_op = new shortcut_1.core.BaseMongoOperator({
            db: 'Bounty',
            coll: 'DropdownPipeline'
        });
        this.setupListener();
    }
    setupListener() {
        this.f_platform.f_bot.on('interactionCreate', async (interaction) => {
            if (interaction.isButton())
                await this.buttonHandler(interaction);
        });
    }
    async buttonHandler(interaction) {
        if (interaction.customId !== 'start-bounty')
            return;
        await interaction.deferReply({ ephemeral: true });
        const in_event_time = this.isNowInBountyWeeklyTimeInterval();
        if (!in_event_time)
            return await interaction.editReply('現在不是可遊玩時間！');
        const user_btn_data = await (await this.confirm_start_button_op.cursor).findOne({ user_id: interaction.user.id });
        if (user_btn_data)
            return await interaction.editReply('問題資訊剛才已發送，請查看私訊！');
        const main_acc = await (await this.account_op.cursor).findOne({ user_id: interaction.user.id });
        if (!main_acc)
            return await interaction.editReply('請先建立你的懸賞區資料！');
        if (!main_acc.auth)
            return await interaction.editReply('你沒有遊玩懸賞區的權限！');
        const create_ongoing_data = await this.createOrGetOngoingInfo(interaction.user.id);
        if (create_ongoing_data.status === shortcut_1.db.StatusCode.WRITE_DATA_ERROR)
            return await interaction.editReply('創建行進資料時發生錯誤');
        else if (create_ongoing_data.status == shortcut_1.db.StatusCode.DATA_FOUND && create_ongoing_data.playing) {
            return await interaction.editReply('請專心回答問題');
        }
        try {
            await (await this.start_button_op.cursor).deleteMany({ user_id: interaction.user.id });
            await (await this.confirm_start_button_op.cursor).deleteMany({ user_id: interaction.user.id });
            await (await this.end_button_op.cursor).deleteMany({ user_id: interaction.user.id });
            await (await this.dropdown_op.cursor).deleteMany({ user_id: interaction.user.id });
        }
        catch (e) { }
        let stamina_consume_type;
        if (create_ongoing_data.stamina.regular > 0)
            stamina_consume_type = '普通';
        else if (create_ongoing_data.stamina.extra > 0)
            stamina_consume_type = '額外';
        else
            return await interaction.editReply('❌ 你沒有足夠的體力！');
        const beautified_qns_thread = await this.qns_thread_beauty.beautify(create_ongoing_data.qns_thread);
        await interaction.editReply({
            embeds: [beautified_qns_thread]
        });
        const qns_data = (0, utils_1.getQnsThreadData)(create_ongoing_data.qns_thread);
        if (qns_data.finished)
            return await interaction.followUp({
                content: '✅ 你已經回答完所有問題了',
                ephemeral: true
            });
        const new_embed = await this.getStartBountyEmbed(qns_data.curr_diffi, qns_data.curr_qns_number, stamina_consume_type);
        let msg;
        try {
            msg = await interaction.user.send('等待驗證資訊...');
            const confirm_start_btn_data = {
                user_id: interaction.user.id,
                msg_id: msg.id,
                qns_info: {
                    difficulty: qns_data.curr_diffi,
                    number: qns_data.curr_qns_number
                },
                due_time: shortcut_1.core.timeAfterSecs(60)
            };
            await (await this.start_button_op.cursor).insertOne(confirm_start_btn_data);
            await msg.edit({
                content: '驗證資訊已創建！',
                embeds: [new_embed],
                components: shortcut_1.core.discord.compAdder([
                    [components_1.default_start_button]
                ])
            });
        }
        catch (err) {
            console.log(err);
            return await interaction.followUp({
                content: '❗ 傳送問題資訊錯誤，請確認你是否有開啟私訊權限',
                ephemeral: true
            });
        }
        if (create_ongoing_data.dm_channel_id === -1) {
            const update_dm_channel_id = {
                $set: {
                    dm_channel_id: msg.channelId
                }
            };
            await (await this.ongoing_op.cursor).updateOne({ user_id: interaction.user.id }, update_dm_channel_id);
        }
        await shortcut_1.core.sleep(60);
        const btn_data = await (await this.start_button_op.cursor).findOne({ user_id: interaction.user.id });
        if (!btn_data)
            return;
        const new_button = await shortcut_1.core.discord.getDisabledButton(components_1.default_start_button);
        await msg.edit({
            components: shortcut_1.core.discord.compAdder([
                [new_button]
            ])
        });
        return await (await this.start_button_op.cursor).deleteOne({ user_id: interaction.user.id });
    }
    isNowInBountyWeeklyTimeInterval() {
        const curr_time = (0, date_fns_tz_1.utcToZonedTime)(Date.now(), 'Asia/Taipei');
        const day = curr_time.getDay() % 7;
        const hour = curr_time.getHours();
        if ((1 <= day && day <= 6) || (day === 0 && hour >= 7) || (day === 6 && hour <= 22))
            return true;
        return false;
    }
    async getStartBountyEmbed(diffi, qns_number, stamina_consume_type) {
        const new_embed = new discord_js_1.MessageEmbed(components_1.default_start_embed)
            .addField('💷 消耗體力', `一格 ${stamina_consume_type} 體力`)
            .addField('🤔 題目難度', diffi, true)
            .addField('#️⃣ 題目編號', qns_number.toString(), true);
        return new_embed;
    }
    async createOrGetOngoingInfo(user_id) {
        const ongoing_data = await (await this.ongoing_op.cursor).findOne({ user_id: user_id });
        if (ongoing_data)
            return {
                status: shortcut_1.db.StatusCode.DATA_FOUND,
                playing: ongoing_data.status,
                dm_channel_id: ongoing_data.dm_channel_id,
                qns_thread: ongoing_data.qns_thread,
                stamina: ongoing_data.stamina
            };
        const new_qns_thread = await this.createQnsThread(user_id);
        const create_result = await this.ongoing_op.createDefaultData({
            user_id: user_id,
            qns_thread: new_qns_thread
        });
        return {
            status: create_result.status,
            dm_channel_id: -1,
            qns_thread: new_qns_thread,
            stamina: {
                regular: 3,
                extra: 0
            }
        };
    }
    async createQnsThread(user_id) {
        const user_main_acc = await (await this.account_op.cursor).findOne({ user_id: user_id });
        const cache = await (await this.db_cache_operator.cursor).findOne({ type: 'cache' });
        const diffi_list = ['easy', 'medium', 'hard'];
        const new_qns_thread = {
            easy: undefined,
            medium: undefined,
            hard: undefined
        };
        diffi_list.forEach(diffi => {
            const max_num = cache[diffi].max_number;
            const skipped_nums = cache[diffi].skipped_numbers;
            const not_answered = [];
            const answered = user_main_acc.qns_record.answered_qns_number[diffi];
            answered.sort((a, b) => a - b);
            for (let i = 0; i <= max_num; i++) {
                if (skipped_nums.length !== 0 && i === skipped_nums[0]) {
                    skipped_nums.shift();
                    continue;
                }
                if (answered.length !== 0 && i === answered[0]) {
                    answered.shift();
                    continue;
                }
                not_answered.push(i);
            }
            shortcut_1.core.shuffle(not_answered);
            const max_qns_count = Math.min(3, not_answered.length);
            new_qns_thread[diffi] = not_answered.slice(0, max_qns_count);
        });
        return new_qns_thread;
    }
}
exports.StartBountyManager = StartBountyManager;
