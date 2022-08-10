"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EndBountyManager = void 0;
const shortcut_1 = require("../../../shortcut");
const discord_js_1 = require("discord.js");
const components_1 = require("./components");
const utils_1 = require("./utils");
class EndBountyManager extends shortcut_1.core.BaseManager {
    constructor(f_platform) {
        super();
        this.cache = new shortcut_1.db.Redis();
        this.alphabet_sequence = [
            'A', 'B', 'C', 'D', 'E',
            'F', 'G', 'H', 'I', 'J',
            'K', 'L', 'M', 'N', 'O',
            'P', 'Q', 'R', 'S', 'T',
            'U', 'V', 'W', 'X', 'Y', 'Z'
        ];
        this.f_platform = f_platform;
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
        if (interaction.customId === 'end-bounty') {
            await interaction.deferReply();
            const stop_answering_time = Date.now();
            const delete_result = await (await this.f_platform.end_button_op.cursor).findOneAndDelete({ user_id: interaction.user.id });
            if (!delete_result.ok) {
                shortcut_1.core.critical_logger.error({
                    message: '[Bounty] 刪除玩家的 end-bounty 按鈕驗證資料時發生錯誤',
                    metadata: {
                        player_id: interaction.user.id
                    }
                });
                return await interaction.editReply('刪除驗證資訊時發生錯誤！');
            }
            const end_btn_data = delete_result.value;
            if (!end_btn_data)
                return await interaction.editReply('抱歉，我們找不到驗證資料...');
            const update_end_bounty = {
                $set: {
                    status: false
                }
            };
            const update_result = await (await this.f_platform.ongoing_op.cursor).findOneAndUpdate({ user_id: interaction.user.id }, update_end_bounty);
            if (!update_result.ok) {
                shortcut_1.core.critical_logger.error({
                    message: '[Bounty] 更新玩家進行中狀態時發生錯誤了',
                    metadata: {
                        player_id: interaction.user.id,
                        new_status: false
                    }
                });
                return await interaction.editReply('抱歉，設定懸賞狀態時發生錯誤了...');
            }
            const new_button = await shortcut_1.core.discord.getDisabledButton(components_1.default_end_button);
            if (interaction.message instanceof discord_js_1.Message)
                await interaction.message.edit({
                    components: shortcut_1.core.discord.compAdder([
                        [new_button, components_1.default_destroy_qns_button]
                    ])
                });
            const ongoing_data = update_result.value;
            const thread_data = (0, utils_1.getQnsThreadData)(ongoing_data.qns_thread);
            const choices = await this.generateQuestionChoices(thread_data.curr_diffi, thread_data.curr_qns_number);
            const ans_dropdown = await this.appendChoicesToDropdown(choices);
            const dp_msg = await interaction.editReply('等待驗證資訊...');
            const dp_data = {
                user_id: interaction.user.id,
                msg_id: dp_msg.id,
                ans_duration: stop_answering_time - end_btn_data.time.start
            };
            const create_result = await (await this.f_platform.dropdown_op.cursor).insertOne(dp_data);
            if (!create_result.acknowledged) {
                shortcut_1.core.critical_logger.error({
                    message: '[Bounty] 創建玩家 dp_data 資料時發生錯誤',
                    metadata: {
                        player_id: interaction.user.id,
                        dp_data: dp_data
                    }
                });
                return await interaction.user.send('創建驗證資訊時發生錯誤...');
            }
            await interaction.editReply({
                content: '請選擇答案（限時30秒）',
                components: shortcut_1.core.discord.compAdder([
                    [ans_dropdown]
                ])
            });
            await shortcut_1.core.sleep(30);
            try {
                if (dp_msg instanceof discord_js_1.Message)
                    await dp_msg.delete();
            }
            catch (e) { }
            try {
                if (interaction.message instanceof discord_js_1.Message)
                    await interaction.message.delete();
            }
            catch (e) { }
            return await (await this.f_platform.dropdown_op.cursor).deleteOne({ user_id: interaction.user.id });
        }
        else if (interaction.customId === 'destroy-bounty-qns') {
            await interaction.deferReply();
            if (interaction.message instanceof discord_js_1.Message) {
                await interaction.message.delete();
                const delete_result = await (await this.f_platform.end_button_op.cursor).findOneAndDelete({ user_id: interaction.user.id });
                if (!delete_result.ok) {
                    shortcut_1.core.critical_logger.error({
                        message: '[Bounty] 刪除玩家 end-btn 驗證資訊時發生錯誤',
                        metadata: {
                            player_id: interaction.user.id
                        }
                    });
                    return await interaction.editReply('刪除驗證資訊時發生錯誤！');
                }
                const update_end_bounty = {
                    $set: {
                        status: false
                    }
                };
                const update_result = await (await this.f_platform.ongoing_op.cursor).findOneAndUpdate({ user_id: interaction.user.id }, update_end_bounty);
                if (!update_result.ok) {
                    shortcut_1.core.critical_logger.error({
                        message: '[Bounty] 更新玩家進行中狀態時發生錯誤了',
                        metadata: {
                            player_id: interaction.user.id,
                            new_status: false
                        }
                    });
                    return await interaction.editReply('抱歉，設定懸賞狀態時發生錯誤了...');
                }
                shortcut_1.core.normal_logger.info({
                    message: '[Bounty] 玩家放棄答題',
                    metadata: {
                        player_id: interaction.user.id
                    }
                });
                return await interaction.editReply('✅ 已放棄答題');
            }
            else
                await interaction.editReply('Message not cached!');
        }
    }
    async generateQuestionChoices(qns_diffi, qns_number) {
        const qns_data = await this.getOrSetQnsCache(qns_diffi, qns_number);
        const qns_choices = this.alphabet_sequence.slice(0, qns_data.max_choices);
        const qns_ans = qns_data.correct_ans;
        if (qns_ans.length === 1)
            return qns_choices;
        let result = await this.getOrSetSubsetsCache(qns_choices, qns_ans.length);
        result = result.filter((item) => { return !(shortcut_1.core.arrayEquals(item, qns_ans)); });
        result = shortcut_1.core.shuffle(result);
        let random_choices_count = Math.min(Math.pow(2, qns_ans.length) + 2, await shortcut_1.core.binomialCoefficient(qns_choices.length, qns_ans.length));
        random_choices_count = Math.min(random_choices_count, 23);
        result = result.slice(0, random_choices_count);
        result.push(qns_ans);
        result = await shortcut_1.core.shuffle(result);
        result = result.map((item) => { return item.join(', '); });
        return result;
    }
    async getOrSetQnsCache(diffi, qns_number) {
        const key = `bounty-qns-data?diffi=${diffi}&number=${qns_number}`;
        const acc_cache_data = await this.cache.client.GET(key);
        if (acc_cache_data !== null)
            return JSON.parse(acc_cache_data);
        const qns_data = await (await this.f_platform.qns_op.cursor).findOne({
            difficulty: diffi,
            number: qns_number
        });
        await this.cache.client.SETEX(key, 1800, JSON.stringify(qns_data));
        return qns_data;
    }
    async getOrSetSubsetsCache(options, ans_length) {
        const key = `subsets-with-length?op_len=${options.length}&ans_len=${ans_length}`;
        const acc_cache_data = await this.cache.client.GET(key);
        if (acc_cache_data !== null)
            return JSON.parse(acc_cache_data);
        const result = await shortcut_1.core.getSubsetsWithCertainLength(options, ans_length);
        await this.cache.client.SETEX(key, 1800, JSON.stringify(result));
        return result;
    }
    async appendChoicesToDropdown(choices) {
        const new_dropdown = new discord_js_1.MessageSelectMenu(components_1.default_select_ans_dropdown);
        const options = [];
        for (let i = 0; i < choices.length; i++) {
            const choice = choices[i];
            options.push({
                label: choice,
                value: choice
            });
        }
        new_dropdown.addOptions(options);
        return new_dropdown;
    }
}
exports.EndBountyManager = EndBountyManager;
