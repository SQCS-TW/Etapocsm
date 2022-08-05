import { core, db } from '../../../shortcut';
import { BountyPlatform } from '../../../platforms/bounty';

import {
    ButtonInteraction,
    Message,
    MessageSelectMenu
} from 'discord.js';

import {
    default_end_button,
    default_select_ans_dropdown,
    default_destroy_qns_button
} from './components';

import { getQnsThreadData } from './utils';

export class EndBountyManager extends core.BaseManager {
    public f_platform: BountyPlatform;
    private cache = new db.Redis();

    private alphabet_sequence = [
        'A', 'B', 'C', 'D', 'E',
        'F', 'G', 'H', 'I', 'J',
        'K', 'L', 'M', 'N', 'O',
        'P', 'Q', 'R', 'S', 'T',
        'U', 'V', 'W', 'X', 'Y', 'Z'
    ];

    constructor(f_platform: BountyPlatform) {
        super();
        this.f_platform = f_platform;

        this.setupListener();
    }

    private setupListener() {
        this.f_platform.f_bot.on('ready', async () => {
            await this.cache.connect();
        });

        this.f_platform.f_bot.on('interactionCreate', async (interaction) => {
            if (interaction.isButton()) await this.buttonHandler(interaction);
        });
    }

    private async buttonHandler(interaction: ButtonInteraction) {
        if (interaction.customId === 'end-bounty') {
            await interaction.deferReply();

            const stop_answering_time = Date.now();

            const delete_result = await (await this.f_platform.end_button_op.cursor).findOneAndDelete({ user_id: interaction.user.id });
            if (!delete_result.ok) return await interaction.editReply('刪除驗證資訊時發生錯誤！');

            const end_btn_data = delete_result.value;
            if (!end_btn_data) return await interaction.editReply('抱歉，我們找不到驗證資料...');
            
            const update_end_bounty = {
                $set: {
                    status: false
                }
            };
            const update_result = await (await this.f_platform.ongoing_op.cursor).findOneAndUpdate({ user_id: interaction.user.id }, update_end_bounty);
            if (!update_result.ok) return await interaction.editReply('抱歉，設定懸賞狀態時發生錯誤了...');
            
            // disabled the end-bounty-btn in qns-pic-msg
            const new_button = await core.discord.getDisabledButton(default_end_button);
            if (interaction.message instanceof Message) await interaction.message.edit({
                components: core.discord.compAdder([
                    [new_button, default_destroy_qns_button]
                ])
            });
            
            const ongoing_data = update_result.value;
            const thread_data = getQnsThreadData(ongoing_data.qns_thread);
            const choices = await this.generateQuestionChoices(thread_data.curr_diffi, thread_data.curr_qns_number);
            const ans_dropdown = await this.appendChoicesToDropdown(choices);

            const dp_msg = await interaction.editReply('等待驗證資訊...');
            const dp_data = {
                user_id: interaction.user.id,
                msg_id: dp_msg.id,
                ans_duration: stop_answering_time - end_btn_data.time.start
            };
            const create_result = await (await this.f_platform.dropdown_op.cursor).insertOne(dp_data);
            if (!create_result.acknowledged) return await interaction.user.send('創建驗證資訊時發生錯誤...');

            await interaction.editReply({
                content: '請選擇答案（限時30秒）',
                components: core.discord.compAdder([
                    [ans_dropdown]
                ])
            });

            await core.sleep(30);

            // after 30 seconds, whether the user had chose the answerer or not,
            // the dropdown and the qns has to be deleted
            try { if (dp_msg instanceof Message) await dp_msg.delete(); }
            catch (e) { /*pass*/ }

            try { if (interaction.message instanceof Message) await interaction.message.delete(); }
            catch (e) { /*pass*/ }

            // delete dp data
            return await (await this.f_platform.dropdown_op.cursor).deleteOne({ user_id: interaction.user.id });

        } else if (interaction.customId === 'destroy-bounty-qns') {
            await interaction.deferReply();
            if (interaction.message instanceof Message) {
                await interaction.message.delete();

                const delete_result = await (await this.f_platform.end_button_op.cursor).findOneAndDelete({ user_id: interaction.user.id });
                if (!delete_result.ok) return await interaction.editReply('刪除驗證資訊時發生錯誤！');

                const update_end_bounty = {
                    $set: {
                        status: false
                    }
                };
                const update_result = await (await this.f_platform.ongoing_op.cursor).findOneAndUpdate({ user_id: interaction.user.id }, update_end_bounty);
                if (!update_result.ok) return await interaction.editReply('抱歉，設定懸賞狀態時發生錯誤了...');

                return await interaction.editReply('✅ 已放棄答題');
            } else await interaction.editReply('Message not cached!');
        }
    }

    private async generateQuestionChoices(qns_diffi: string, qns_number: number) {
        // ex:
        // const qns_choices = ['A', 'B', 'C', 'D', 'E', 'F'];
        // const qns_ans = ['A', 'C'];

        const qns_data = await this.getOrSetQnsCache(qns_diffi, qns_number);

        const qns_choices = this.alphabet_sequence.slice(0, qns_data.max_choices);
        const qns_ans = qns_data.correct_ans;

        if (qns_ans.length === 1) return qns_choices;

        let result: Array<any> = await this.getOrSetSubsetsCache(qns_choices, qns_ans.length);

        result = result.filter((item) => { return !(core.arrayEquals(item, qns_ans)) });
        result = core.shuffle(result);

        let random_choices_count = Math.min(
            Math.pow(2, qns_ans.length) + 2,
            await core.binomialCoefficient(qns_choices.length, qns_ans.length)
        );

        // discord dropdown choices limit: 25 (1 slot for push qns_ans)
        random_choices_count = Math.min(random_choices_count, 23);

        result = result.slice(0, random_choices_count);
        result.push(qns_ans);
        result = await core.shuffle(result);
        result = result.map((item) => { return item.join(', ') });

        return result;
    }

    private async getOrSetQnsCache(diffi: string, qns_number: number) {
        const key = `bounty-qns-data?diffi=${diffi}&number=${qns_number}`;
        const acc_cache_data = await this.cache.client.GET(key);

        if (acc_cache_data !== null) return JSON.parse(acc_cache_data);

        const qns_data = await (await this.f_platform.qns_op.cursor).findOne({
            difficulty: diffi,
            number: qns_number
        });

        await this.cache.client.SETEX(key, 1800, JSON.stringify(qns_data));
        return qns_data;
    }

    private async getOrSetSubsetsCache(options: string[], ans_length: number) {
        const key = `subsets-with-length?op_len=${options.length}&ans_len=${ans_length}`;
        const acc_cache_data = await this.cache.client.GET(key);

        if (acc_cache_data !== null) return JSON.parse(acc_cache_data);

        const result = await core.getSubsetsWithCertainLength(options, ans_length);

        await this.cache.client.SETEX(key, 1800, JSON.stringify(result));
        return result;
    }

    private async appendChoicesToDropdown(choices: string[]) {
        const new_dropdown = new MessageSelectMenu(default_select_ans_dropdown);

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
