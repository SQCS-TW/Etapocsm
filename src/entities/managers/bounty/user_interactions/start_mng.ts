import { core, db } from '../../../shortcut';
import { ObjectId } from 'mongodb';

import {
    ButtonInteraction,
    MessageEmbed
} from 'discord.js';

import {
    default_start_button,
    default_start_embed
} from './components';

import { getQnsThreadData, QnsThreadBeautifier } from './utils';


export class StartBountyManager extends core.BaseManager {
    private account_op = new core.BountyUserAccountOperator();
    private ongoing_op = new core.BountyUserOngoingInfoOperator();

    private start_button_op = new core.BaseMongoOperator({
        db: 'Bounty',
        coll: 'StartButtonPipeline'
    });

    private qns_thread_beauty = new QnsThreadBeautifier();

    // for reseting user data
    private confirm_start_button_op = new core.BaseMongoOperator({
        db: 'Bounty',
        coll: 'StartButtonPipeline'
    });
    private end_button_op = new core.BaseMongoOperator({
        db: 'Bounty',
        coll: 'EndButtonPipeline'
    });
    private dropdown_op = new core.BaseMongoOperator({
        db: 'Bounty',
        coll: 'DropdownPipeline'
    });


    constructor(f_platform: core.BasePlatform) {
        super(f_platform);

        this.setupListener();
    }

    private setupListener() {
        this.f_platform.f_bot.on('interactionCreate', async (interaction) => {
            if (interaction.isButton()) await this.buttonHandler(interaction);
        });
    }

    private async buttonHandler(interaction: ButtonInteraction) {
        if (interaction.customId !== 'start-bounty') return;

        await interaction.deferReply({ ephemeral: true });

        const check_main_acc = await this.account_op.checkDataExistence({ user_id: interaction.user.id });
        if (check_main_acc.status === db.StatusCode.DATA_NOT_FOUND) return await interaction.editReply('請先建立你的懸賞區資料！');

        const user_acc = await (await this.account_op.cursor_promise).findOne({ user_id: interaction.user.id });
        if (!user_acc.auth) return await interaction.editReply('你沒有遊玩懸賞區的權限！');

        const user_ongoing_data = await (await this.ongoing_op.cursor_promise).findOne({ user_id: interaction.user.id });
        if (user_ongoing_data.status) return await interaction.editReply('你已經在遊玩懸賞區了！');

        // delete all user remained data
        try {
            await (await this.start_button_op.cursor_promise).findOneAndDelete({ user_id: interaction.user.id });
            await (await this.confirm_start_button_op.cursor_promise).findOneAndDelete({ user_id: interaction.user.id });
            await (await this.end_button_op.cursor_promise).findOneAndDelete({ user_id: interaction.user.id });
            await (await this.dropdown_op.cursor_promise).findOneAndDelete({ user_id: interaction.user.id });
        } catch (e) { /*pass*/ }


        const create_result = await this.createOrGetOngoingInfo(interaction.user.id, {
            account_op: this.account_op,
            ongoing_op: this.ongoing_op
        });

        if (create_result.status === db.StatusCode.WRITE_DATA_ERROR) return await interaction.editReply('創建問題串失敗！');
        else if (create_result.status === db.StatusCode.WRITE_DATA_SUCCESS) await interaction.editReply('問題串已建立！');
        else if (create_result.status === db.StatusCode.DATA_FOUND) await interaction.editReply('找到資料');

        let stamina_consume_type: string;
        if (create_result.stamina.regular > 0) {
            stamina_consume_type = '普通'
        } else if (create_result.stamina.extra > 0) {
            stamina_consume_type = '額外'
        } else {
            return await interaction.followUp('❌ 你沒有足夠的體力！');
        }

        const beautified_qns_thread = await this.qns_thread_beauty.beautify(create_result.qns_thread);
        await interaction.followUp({
            embeds: [beautified_qns_thread],
            ephemeral: true
        });

        const qns_data = await getQnsThreadData(create_result.qns_thread);

        if (qns_data.finished) return await interaction.followUp('✅ 你已經回答完所有問題了！');

        // ==== modify embed -> set difficulty and qns_number
        const new_embed = await this.getStartBountyEmbed(qns_data.curr_diffi, qns_data.curr_qns_number, stamina_consume_type);

        let msg;
        try {
            msg = await interaction.user.send({
                embeds: [new_embed],
                components: core.discord.compAdder([
                    [default_start_button]
                ])
            });
        } catch {
            return await interaction.followUp({
                content: '❗ 傳送問題資訊錯誤，請確認你是否有開啟私訊權限',
                ephemeral: true
            });
        }

        const button_data = {
            _id: new ObjectId(),
            user_id: interaction.user.id,
            channel_id: msg.channelId,
            msg_id: msg.id,
            qns_info: {
                difficulty: qns_data.curr_diffi,
                number: qns_data.curr_qns_number
            },
            due_time: Date.now() + 60 * 1000
        }
        await (await this.start_button_op.cursor_promise).insertOne(button_data);

        await core.sleep(60);

        const btn_data = await (await this.start_button_op.cursor_promise).findOne({ user_id: interaction.user.id });
        if (!btn_data) return;

        const new_button = await core.discord.getDisabledButton(default_start_button);

        await msg.edit({
            components: core.discord.compAdder([
                [new_button]
            ])
        });

        return await (await this.start_button_op.cursor_promise).deleteOne({ user_id: interaction.user.id });
    }

    private async getStartBountyEmbed(diffi: string, qns_number: number, stamina_consume_type: string) {
        const new_embed = new MessageEmbed(default_start_embed)
            .addField('💷 消耗體力', `一格 ${stamina_consume_type} 體力`)
            .addField('🤔 題目難度', diffi, true)
            .addField('#️⃣ 題目編號', qns_number.toString(), true);
        return new_embed;
    }

    async createOrGetOngoingInfo(user_id: string, ops) {
        const data_exists = await ops.ongoing_op.checkDataExistence({ user_id: user_id });
        if (data_exists.status === db.StatusCode.DATA_FOUND) {
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
            qns_thread: new_qns_thread
        }
    }

    private async createQnsThread(user_id: string, ops) {
        const user_main_acc = await (await ops.account_op.cursor_promise).findOne({ user_id: user_id });

        const db_cache_operator = new core.BaseMongoOperator({
            db: 'Bounty',
            coll: 'StorjQnsDBCache'
        });

        const cache = await (await db_cache_operator.cursor_promise).findOne({ type: 'cache' });

        const diffi_list = ['easy', 'medium', 'hard'];
        const new_qns_thread = {
            easy: undefined,
            medium: undefined,
            hard: undefined
        }
        await core.asyncForEach(diffi_list, async (diffi) => {
            const max_num: number = cache[diffi].max_number;
            const skipped_nums: number[] = cache[diffi].skipped_numbers;

            const not_answered = []
            const answered: number[] = user_main_acc.qns_record.answered_qns_number[diffi];
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
            await core.shuffle(not_answered);

            const max_qns_count = Math.min(3, not_answered.length);
            new_qns_thread[diffi] = not_answered.slice(0, max_qns_count);
        });

        return new_qns_thread;
    }
}