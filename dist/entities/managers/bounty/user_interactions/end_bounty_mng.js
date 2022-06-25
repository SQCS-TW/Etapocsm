"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EndBountyManager = void 0;
const shortcut_1 = require("../../../shortcut");
const mongodb_1 = require("mongodb");
const discord_js_1 = require("discord.js");
const components_1 = require("./components");
const utils_1 = require("./utils");
class EndBountyManager extends shortcut_1.core.BaseManager {
    constructor(f_platform) {
        super(f_platform);
        this.ongoing_op = new shortcut_1.core.BountyUserOngoingInfoOperator();
        this.qns_op = new shortcut_1.core.BountyQnsDBOperator();
        this.cache = new shortcut_1.db.Redis();
        this.end_button_op = new shortcut_1.core.BaseMongoOperator({
            db: 'Bounty',
            coll: 'EndButtonPipeline'
        });
        this.dropdown_op = new shortcut_1.core.BaseMongoOperator({
            db: 'Bounty',
            coll: 'DropdownPipeline'
        });
        this.alphabet_sequence = [
            'A', 'B', 'C', 'D', 'E',
            'F', 'G', 'H', 'I', 'J',
            'K', 'L', 'M', 'N', 'O',
            'P', 'Q', 'R', 'S', 'T',
            'U', 'V', 'W', 'X', 'Y', 'Z'
        ];
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
            const user_end_btn_data = await (await this.end_button_op.cursor_promise).findOne({ user_id: interaction.user.id });
            await (await this.end_button_op.cursor_promise).deleteOne({ user_id: interaction.user.id });
            const channel = await this.f_platform.f_bot.channels.fetch(user_end_btn_data.channel_id);
            if (!(channel instanceof discord_js_1.DMChannel))
                return;
            const start_bounty_execute = {
                $set: {
                    status: false
                }
            };
            await (await this.ongoing_op.cursor_promise).updateOne({ user_id: interaction.user.id }, start_bounty_execute);
            const msg = await channel.messages.fetch(user_end_btn_data.msg_id);
            const new_button = await shortcut_1.core.discord.getDisabledButton(components_1.default_end_button);
            await msg.edit({
                components: shortcut_1.core.discord.compAdder([
                    [new_button, components_1.default_destroy_qns_button]
                ])
            });
            const user_ongoing_data = await (await this.ongoing_op.cursor_promise).findOne({ user_id: interaction.user.id });
            const thread_data = await (0, utils_1.getQnsThreadData)(user_ongoing_data.qns_thread);
            const choices = await this.generateQuestionChoices(thread_data.curr_diffi, thread_data.curr_qns_number);
            const ans_dropdown = await this.appendChoicesToDropdown(choices);
            const dp_msg = await interaction.editReply({
                content: '請選擇答案（限時30秒）',
                components: shortcut_1.core.discord.compAdder([
                    [ans_dropdown]
                ])
            });
            if (!(dp_msg instanceof discord_js_1.Message))
                return await interaction.channel.send('err dealing with types');
            const dp_data = {
                _id: new mongodb_1.ObjectId(),
                user_id: interaction.user.id,
                channel_id: dp_msg.channelId,
                msg_id: dp_msg.id,
                ans_duration: stop_answering_time - user_end_btn_data.time.start
            };
            const create_result = await (await this.dropdown_op.cursor_promise).insertOne(dp_data);
            if (!create_result.acknowledged)
                return await interaction.channel.send('新增dp驗證時發生錯誤！');
            await shortcut_1.core.sleep(30);
            try {
                if (dp_msg instanceof discord_js_1.Message)
                    await dp_msg.delete();
            }
            catch (e) { /*pass*/ }
            const user_dp_data = await (await this.dropdown_op.cursor_promise).findOne({ user_id: interaction.user.id });
            if (!user_dp_data)
                return;
            try {
                if (msg instanceof discord_js_1.Message)
                    await msg.delete();
            }
            catch (e) { /*pass*/ }
        }
        else if (interaction.customId === 'destroy-bounty-qns') {
            await interaction.deferReply();
            if (interaction.message instanceof discord_js_1.Message)
                await interaction.message.delete();
            await interaction.editReply('✅ 圖片已銷毀');
        }
    }
    async generateQuestionChoices(qns_diffi, qns_number) {
        // ex:
        // const qns_choices = ['A', 'B', 'C', 'D', 'E', 'F'];
        // const qns_ans = ['A', 'C'];
        const sd = Date.now();
        const qns_data = await this.getOrSetQnsCache(qns_diffi, qns_number);
        const ed = Date.now();
        const sp = Date.now();
        const qns_choices = this.alphabet_sequence.slice(0, qns_data.max_choices);
        const qns_ans = qns_data.correct_ans;
        if (qns_ans.length === 1)
            return qns_choices;
        let result = await this.getOrSetSubsetsCache(qns_choices, qns_ans.length);
        result = result.filter((item) => { return !(shortcut_1.core.arrayEquals(item, qns_ans)); });
        result = await shortcut_1.core.shuffle(result);
        let random_choices_count = Math.min(Math.pow(2, qns_ans.length) + 2, await shortcut_1.core.binomialCoefficient(qns_choices.length, qns_ans.length));
        // discord dropdown choices limit: 25 (1 slot for push qns_ans)
        random_choices_count = Math.min(random_choices_count, 24);
        result = result.slice(0, random_choices_count);
        result.push(qns_ans);
        result = await shortcut_1.core.shuffle(result);
        result = result.map((item) => { return item.join(', '); });
        console.log(result);
        const ep = Date.now();
        console.log('fetch db', ed - sd);
        console.log('pro data', qns_choices.length, qns_ans.length);
        console.log('pro time', ep - sp);
        return result;
    }
    async getOrSetQnsCache(diffi, qns_number) {
        const key = `bounty-qns-data?diffi=${diffi}&number=${qns_number}`;
        const acc_cache_data = await this.cache.client.GET(key);
        if (acc_cache_data !== null)
            return JSON.parse(acc_cache_data);
        const qns_data = await (await this.qns_op.cursor_promise).findOne({
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
