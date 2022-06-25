"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StartBountyManager = void 0;
const shortcut_1 = require("../../../shortcut");
const mongodb_1 = require("mongodb");
const discord_js_1 = require("discord.js");
const components_1 = require("./components");
const utils_1 = require("./utils");
class StartBountyManager extends shortcut_1.core.BaseManager {
    constructor(f_platform) {
        super(f_platform);
        this.account_op = new shortcut_1.core.BountyUserAccountOperator();
        this.ongoing_op = new shortcut_1.core.BountyUserOngoingInfoOperator();
        this.start_button_op = new shortcut_1.core.BaseMongoOperator({
            db: 'Bounty',
            coll: 'StartButtonPipeline'
        });
        this.qns_thread_beauty = new utils_1.QnsThreadBeautifier();
        // for reseting user data
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
        const check_main_acc = await this.account_op.checkDataExistence({ user_id: interaction.user.id });
        if (check_main_acc.status === shortcut_1.db.StatusCode.DATA_NOT_FOUND)
            return await interaction.editReply('請先建立你的懸賞區資料！');
        const user_acc = await (await this.account_op.cursor_promise).findOne({ user_id: interaction.user.id });
        if (!user_acc.auth)
            return await interaction.editReply('你沒有遊玩懸賞區的權限！');
        const user_ongoing_data = await (await this.ongoing_op.cursor_promise).findOne({ user_id: interaction.user.id });
        if (user_ongoing_data && user_ongoing_data.status)
            return await interaction.editReply('你已經在遊玩懸賞區了！');
        const user_btn_data = await (await this.confirm_start_button_op.cursor_promise).findOne({ user_id: interaction.user.id });
        if (user_btn_data)
            return await interaction.editReply('問題資訊已發送，請查看私訊！');
        // delete all remained data of user
        try {
            await (await this.start_button_op.cursor_promise).findOneAndDelete({ user_id: interaction.user.id });
            await (await this.confirm_start_button_op.cursor_promise).findOneAndDelete({ user_id: interaction.user.id });
            await (await this.end_button_op.cursor_promise).findOneAndDelete({ user_id: interaction.user.id });
            await (await this.dropdown_op.cursor_promise).findOneAndDelete({ user_id: interaction.user.id });
        }
        catch (e) { /*pass*/ }
        //
        const create_result = await this.createOrGetOngoingInfo(interaction.user.id, {
            account_op: this.account_op,
            ongoing_op: this.ongoing_op
        });
        if (create_result.status === shortcut_1.db.StatusCode.WRITE_DATA_ERROR)
            return await interaction.editReply('創建問題串失敗！');
        else if (create_result.status === shortcut_1.db.StatusCode.WRITE_DATA_SUCCESS)
            await interaction.editReply('問題串已建立，請查看私訊！');
        else if (create_result.status === shortcut_1.db.StatusCode.DATA_FOUND)
            await interaction.editReply('找到資料，請查看私訊！');
        let stamina_consume_type;
        if (create_result.stamina.regular > 0) {
            stamina_consume_type = '普通';
        }
        else if (create_result.stamina.extra > 0) {
            stamina_consume_type = '額外';
        }
        else {
            return await interaction.followUp('❌ 你沒有足夠的體力！');
        }
        const beautified_qns_thread = await this.qns_thread_beauty.beautify(create_result.qns_thread);
        await interaction.followUp({
            embeds: [beautified_qns_thread],
            ephemeral: true
        });
        const qns_data = await (0, utils_1.getQnsThreadData)(create_result.qns_thread);
        if (qns_data.finished)
            return await interaction.followUp({
                content: '✅ 你已經回答完所有問題了，故未私訊！',
                ephemeral: true
            });
        // ==== modify embed -> set difficulty and qns_number
        const new_embed = await this.getStartBountyEmbed(qns_data.curr_diffi, qns_data.curr_qns_number, stamina_consume_type);
        let msg;
        try {
            msg = await interaction.user.send({
                embeds: [new_embed],
                components: shortcut_1.core.discord.compAdder([
                    [components_1.default_start_button]
                ])
            });
        }
        catch {
            return await interaction.followUp({
                content: '❗ 傳送問題資訊錯誤，請確認你是否有開啟私訊權限',
                ephemeral: true
            });
        }
        const button_data = {
            _id: new mongodb_1.ObjectId(),
            user_id: interaction.user.id,
            channel_id: msg.channelId,
            msg_id: msg.id,
            qns_info: {
                difficulty: qns_data.curr_diffi,
                number: qns_data.curr_qns_number
            },
            due_time: Date.now() + 60 * 1000
        };
        await (await this.start_button_op.cursor_promise).insertOne(button_data);
        await shortcut_1.core.sleep(60);
        const btn_data = await (await this.start_button_op.cursor_promise).findOne({ user_id: interaction.user.id });
        if (!btn_data)
            return;
        const new_button = await shortcut_1.core.discord.getDisabledButton(components_1.default_start_button);
        await msg.edit({
            components: shortcut_1.core.discord.compAdder([
                [new_button]
            ])
        });
        return await (await this.start_button_op.cursor_promise).deleteOne({ user_id: interaction.user.id });
    }
    async getStartBountyEmbed(diffi, qns_number, stamina_consume_type) {
        const new_embed = new discord_js_1.MessageEmbed(components_1.default_start_embed)
            .addField('💷 消耗體力', `一格 ${stamina_consume_type} 體力`)
            .addField('🤔 題目難度', diffi, true)
            .addField('#️⃣ 題目編號', qns_number.toString(), true);
        return new_embed;
    }
    async createOrGetOngoingInfo(user_id, ops) {
        const data_exists = await ops.ongoing_op.checkDataExistence({ user_id: user_id });
        if (data_exists.status === shortcut_1.db.StatusCode.DATA_FOUND) {
            const user_ongoing_info = await (await ops.ongoing_op.cursor_promise).findOne({ user_id: user_id });
            return {
                status: data_exists.status,
                qns_thread: user_ongoing_info.qns_thread,
                stamina: user_ongoing_info.stamina
            };
        }
        const new_qns_thread = await this.createQnsThread(user_id, ops);
        const create_result = await ops.ongoing_op.createDefaultData({
            user_id: user_id,
            qns_thread: new_qns_thread
        });
        return {
            status: create_result.status,
            qns_thread: new_qns_thread,
            stamina: {
                regular: 3,
                extra: 0
            }
        };
    }
    async createQnsThread(user_id, ops) {
        const user_main_acc = await (await ops.account_op.cursor_promise).findOne({ user_id: user_id });
        const db_cache_operator = new shortcut_1.core.BaseMongoOperator({
            db: 'Bounty',
            coll: 'StorjQnsDBCache'
        });
        const cache = await (await db_cache_operator.cursor_promise).findOne({ type: 'cache' });
        const diffi_list = ['easy', 'medium', 'hard'];
        const new_qns_thread = {
            easy: undefined,
            medium: undefined,
            hard: undefined
        };
        await shortcut_1.core.asyncForEach(diffi_list, async (diffi) => {
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
            await shortcut_1.core.shuffle(not_answered);
            const max_qns_count = Math.min(3, not_answered.length);
            new_qns_thread[diffi] = not_answered.slice(0, max_qns_count);
        });
        return new_qns_thread;
    }
}
exports.StartBountyManager = StartBountyManager;
