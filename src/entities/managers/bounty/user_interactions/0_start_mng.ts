import { core, db } from '../../../shortcut';
import { ObjectId } from 'mongodb';

import {
    ButtonInteraction,
    Message,
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
    private db_cache_operator = new core.BaseMongoOperator({
        db: 'Bounty',
        coll: 'StorjQnsDBCache'
    });

    private qns_thread_beauty = new QnsThreadBeautifier();

    // for resetting user data
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

        // check if the user had already pressed this button before
        const user_btn_data = await (await this.confirm_start_button_op.cursor).findOne({ user_id: interaction.user.id });
        if (user_btn_data) return await interaction.editReply('問題資訊剛才已發送，請查看私訊！');
        //

        const main_acc = await (await this.account_op.cursor).findOne({ user_id: interaction.user.id });
        if (!main_acc) return await interaction.editReply('請先建立你的懸賞區資料！');
        if (!main_acc.auth) return await interaction.editReply('你沒有遊玩懸賞區的權限！');

        const create_ongoing_data = await this.createOrGetOngoingInfo(interaction.user.id);
        if (create_ongoing_data.status === db.StatusCode.WRITE_DATA_ERROR) return await interaction.editReply('創建行進資料時發生錯誤');
        else if (create_ongoing_data.status == db.StatusCode.DATA_FOUND && create_ongoing_data.playing) {
            return await interaction.editReply('請專心回答問題');
        }

        // delete all remained data of user
        try {
            await (await this.start_button_op.cursor).deleteMany({ user_id: interaction.user.id });
            await (await this.confirm_start_button_op.cursor).deleteMany({ user_id: interaction.user.id });
            await (await this.end_button_op.cursor).deleteMany({ user_id: interaction.user.id });
            await (await this.dropdown_op.cursor).deleteMany({ user_id: interaction.user.id });
        } catch (e) { /*pass*/ }


        // check if user has the stamina to play
        let stamina_consume_type: string;
        if (create_ongoing_data.stamina.regular > 0) stamina_consume_type = '普通';
        else if (create_ongoing_data.stamina.extra > 0) stamina_consume_type = '額外';
        else return await interaction.editReply('❌ 你沒有足夠的體力！');

        // send user current answering status
        const beautified_qns_thread = await this.qns_thread_beauty.beautify(create_ongoing_data.qns_thread);
        await interaction.editReply({
            embeds: [beautified_qns_thread]
        });

        const qns_data = getQnsThreadData(create_ongoing_data.qns_thread);

        if (qns_data.finished) return await interaction.followUp({
            content: '✅ 你已經回答完所有問題了',
            ephemeral: true
        });

        // ==== modify embed -> set difficulty and qns_number
        const new_embed = await this.getStartBountyEmbed(qns_data.curr_diffi, qns_data.curr_qns_number, stamina_consume_type);

        let msg: Message;
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

        if (create_ongoing_data.dm_channel_id === -1) {
            const update_dm_channel_id = {
                $set: {
                    dm_channel_id: msg.channelId
                }
            }
            await (await this.ongoing_op.cursor).updateOne({ user_id: interaction.user.id }, update_dm_channel_id);
        }

        const confirm_start_btn_data = {
            _id: new ObjectId(),
            user_id: interaction.user.id,
            msg_id: msg.id,
            qns_info: {
                difficulty: qns_data.curr_diffi,
                number: qns_data.curr_qns_number
            },
            due_time: core.timeAfterSecs(60)
        }
        await (await this.start_button_op.cursor).insertOne(confirm_start_btn_data);

        await core.sleep(60);

        // If the btn data has been deleted,
        // that means the user has already pressed the confirm-bounty-btn.
        // Otherwise, it has to be disabled, and then delete the btn data
        const btn_data = await (await this.start_button_op.cursor).findOne({ user_id: interaction.user.id });
        if (!btn_data) return;

        const new_button = await core.discord.getDisabledButton(default_start_button);
        await msg.edit({
            components: core.discord.compAdder([
                [new_button]
            ])
        });
        return await (await this.start_button_op.cursor).deleteOne({ user_id: interaction.user.id });
        //
    }

    private async getStartBountyEmbed(diffi: string, qns_number: number, stamina_consume_type: string) {
        const new_embed = new MessageEmbed(default_start_embed)
            .addField('💷 消耗體力', `一格 ${stamina_consume_type} 體力`)
            .addField('🤔 題目難度', diffi, true)
            .addField('#️⃣ 題目編號', qns_number.toString(), true);
        return new_embed;
    }

    async createOrGetOngoingInfo(user_id: string) {
        const ongoing_data = await (await this.ongoing_op.cursor).findOne({ user_id: user_id });
        if (ongoing_data) return {
            status: db.StatusCode.DATA_FOUND,
            playing: ongoing_data.status,
            dm_channel_id: ongoing_data.dm_channel_id,
            qns_thread: ongoing_data.qns_thread,
            stamina: ongoing_data.stamina
        };

        // setup user ongoing data
        const new_qns_thread = await this.createQnsThread(user_id);
        const create_result = await this.ongoing_op.createDefaultData({
            user_id: user_id,
            qns_thread: new_qns_thread
        });
        //

        return {
            status: create_result.status,
            dm_channel_id: -1,
            qns_thread: new_qns_thread,
            stamina: {
                regular: 3,
                extra: 0
            }
        }
    }

    private async createQnsThread(user_id: string) {
        const user_main_acc = await (await this.account_op.cursor).findOne({ user_id: user_id });
        const cache = await (await this.db_cache_operator.cursor).findOne({ type: 'cache' });

        const diffi_list = ['easy', 'medium', 'hard'];
        const new_qns_thread = {
            easy: undefined,
            medium: undefined,
            hard: undefined
        };
        diffi_list.forEach(diffi => {
            const max_num: number = cache[diffi].max_number;
            const skipped_nums: number[] = cache[diffi].skipped_numbers;

            const not_answered = [];
            const answered: number[] = user_main_acc.qns_record.answered_qns_number[diffi];
            answered.sort((a, b) => a - b);

            // find max-num and skipped-num
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
            //

            // setting user qns-thread
            core.shuffle(not_answered);

            const max_qns_count = Math.min(3, not_answered.length);
            new_qns_thread[diffi] = not_answered.slice(0, max_qns_count);
            //
        });

        return new_qns_thread;
    }
}