import { core, db } from '../../../shortcut';

import {
    SelectMenuInteraction,
    Message,
    MessageEmbed
} from 'discord.js';

import { getQnsThreadData } from './utils';


export class SelectBountyAnswerManager extends core.BaseManager {
    private account_op = new core.BountyUserAccountOperator();
    private ongoing_op = new core.BountyUserOngoingInfoOperator();
    private qns_op = new core.BountyQnsDBOperator();

    private dropdown_op = new core.BaseMongoOperator({
        db: 'Bounty',
        coll: 'DropdownPipeline'
    });

    private cache = new db.Redis();

    private qns_diffi_exp = {
        'easy': 10,
        'medium': 10 * 2,
        'hard': 10 * 3
    };
    private qns_diffi_time = {
        'easy': 60,
        'medium': 60 * 2,
        'hard': 60 * 3
    };
    private qns_ext_stamina_portion = {
        'easy': 1 / 4,
        'medium': 1 / 3,
        'hard': 1 / 3
    };

    constructor(f_platform: core.BasePlatform) {
        super(f_platform);

        this.setupListener();
    }

    private setupListener() {
        this.f_platform.f_bot.on('ready', async () => {
            await this.cache.connect();
        });

        this.f_platform.f_bot.on('interactionCreate', async (interaction) => {
            if (interaction.isSelectMenu()) await this.dropdownHandler(interaction);
        });
    }

    private async dropdownHandler(interaction: SelectMenuInteraction) {
        if (interaction.customId !== 'choose-bounty-answers') return;

        await interaction.deferReply();

        // auth
        const user_dp_data = await (await this.dropdown_op.cursor_promise).findOne({ user_id: interaction.user.id });

        if (!user_dp_data) return await interaction.editReply('找不到驗證資訊！');
        if (user_dp_data.channel_id !== interaction.channelId) return await interaction.editReply('驗證資訊錯誤！');
        if (user_dp_data.msg_id !== interaction.message.id) return await interaction.editReply('驗證資訊錯誤！');

        await (await this.dropdown_op.cursor_promise).deleteOne({ user_id: interaction.user.id });
        //

        // fetch data
        const user_ongoing_info = await (await this.ongoing_op.cursor_promise).findOne({ user_id: interaction.user.id });
        const thread_data = await getQnsThreadData(user_ongoing_info.qns_thread);
        const qns_data = await this.getOrSetQnsCache(thread_data.curr_diffi, thread_data.curr_qns_number);
        //

        if (interaction.message instanceof Message) await interaction.message.delete();

        const bounty_result_embed = new MessageEmbed()
            .setTitle(`🚩｜你選擇了 ${interaction.values[0]}`)
            .setColor('#ffffff');

        const correct = this.isUserCorrect(interaction, qns_data.correct_ans);
        if (correct) bounty_result_embed.setDescription('恭喜，這是正確答案！');
        else bounty_result_embed.setDescription('可惜，這不是正確答案');

        const give_result = await this.giveExp(correct, thread_data.curr_diffi, interaction.user.id);
        if (give_result.status === db.StatusCode.WRITE_DATA_SUCCESS) bounty_result_embed.addField('✨ 獲得經驗值', `**${give_result.delta_exp}** exp`, true);
        else await interaction.channel.send(`給你 ${give_result.delta_exp} exp 時發生錯誤了！`);

        let new_thread = undefined;
        if (correct) {
            const result = await this.updateQnsThread(interaction.user.id, user_ongoing_info.qns_thread, thread_data.curr_diffi)
            if (result.status === db.StatusCode.WRITE_DATA_ERROR) await interaction.channel.send('更新問題串時發生錯誤');
            new_thread = result.new_thread;
        }

        if (correct) {
            // extra stamina
            const can_gain_ext_stamina = await this.canUserGainExtraStamina(
                user_dp_data.ans_duration,
                this.qns_diffi_time[thread_data.curr_diffi],
                this.qns_ext_stamina_portion[thread_data.curr_diffi]
            );
            if (!can_gain_ext_stamina) return;

            const give_result = await this.giveExtraStamina(interaction, user_ongoing_info.stamina.extra_gained);
            if (give_result.result === 'gave') bounty_result_embed.addField('⚡ 獲得額外體力', `${give_result.gave} 格`, true);
            if (give_result.result === 'overflow') bounty_result_embed.addField('⚡ 獲得額外體力', `可獲得數量已到上限\n自動轉為 **${give_result.overflow_exp}** exp`, true);
        }

        await interaction.editReply({
            embeds: [bounty_result_embed]
        });

        const stat_result = await this.updateStatistics(
            interaction.user.id,
            correct,
            thread_data.curr_diffi,
            thread_data.curr_qns_number,
            new_thread
        );
        if (!stat_result) await interaction.channel.send('更新統計資料時發生錯誤');
        return;
    }

    private async getOrSetQnsCache(diffi: string, qns_number: number) {
        const key = `bounty-qns-data?diffi=${diffi}&number=${qns_number}`;
        const acc_cache_data = await this.cache.client.GET(key);

        if (acc_cache_data !== null) return JSON.parse(acc_cache_data);

        const qns_data = await (await this.qns_op.cursor_promise).findOne({
            difficulty: diffi,
            number: qns_number
        });

        await this.cache.client.SETEX(key, 1800, JSON.stringify(qns_data));
        return qns_data;
    }

    private isUserCorrect(interaction, correct_ans) {
        const user_choice = interaction.values[0].split(', ');
        const correct = core.arrayEquals(user_choice, correct_ans);
        return correct;
    }

    private async giveExp(correct, diffi, user_id) {
        let delta_exp: number;

        if (!correct) delta_exp = 2;
        else delta_exp = this.qns_diffi_exp[diffi];

        const execute = {
            $inc: {
                exp: delta_exp
            }
        };
        const update_result = await (await this.account_op.cursor_promise).updateOne({ user_id: user_id }, execute);

        let status: string;
        if (update_result.acknowledged) status = db.StatusCode.WRITE_DATA_SUCCESS;
        else status = db.StatusCode.WRITE_DATA_ERROR;

        return {
            status: status,
            delta_exp: delta_exp
        };
    }

    private async updateQnsThread(user_id, user_qns_thread, diffi) {
        user_qns_thread[diffi].shift();

        const execute = {
            $set: {
                [`qns_thread.${diffi}`]: user_qns_thread[diffi]
            }
        };
        const update_result = await (await this.ongoing_op.cursor_promise).updateOne({ user_id: user_id }, execute);

        let status: string;
        if (update_result.acknowledged) status = db.StatusCode.WRITE_DATA_SUCCESS;
        else status = db.StatusCode.WRITE_DATA_ERROR;

        return {
            status: status,
            new_thread: user_qns_thread
        };
    }

    private async updateStatistics(user_id, correct, qns_diffi, qns_number, new_thread) {
        let execute;
        let cleared_execute = undefined;
        if (!correct) {
            execute = {
                $inc: {
                    [`qns_record.answered_qns_count.${qns_diffi}`]: 1
                }
            };
        } else {
            execute = {
                $inc: {
                    [`qns_record.answered_qns_count.${qns_diffi}`]: 1,
                    [`qns_record.correct_qns_count.${qns_diffi}`]: 1
                },
                $push: {
                    [`qns_record.answered_qns_number.${qns_diffi}`]: qns_number
                }
            };

            let thread_cleared_count = 0;
            let thread_all_cleared_count = 0;

            if (new_thread[qns_diffi].length === 0) {
                thread_cleared_count++;
                if (qns_diffi === 'hard') thread_all_cleared_count++;
            }

            cleared_execute = {
                $inc: {
                    "personal_record.thread_cleared_count": thread_cleared_count,
                    "personal_record.thread_all_cleared_count": thread_all_cleared_count
                }
            }
        }

        let final_result: boolean;
        if (cleared_execute === undefined) {
            const execute_result = await (await this.account_op.cursor_promise).updateOne({ user_id: user_id }, execute);
            final_result = execute_result.acknowledged;
        } else {
            const execute_result = await (await this.account_op.cursor_promise).updateOne({ user_id: user_id }, execute);
            const cleared_result = await (await this.account_op.cursor_promise).updateOne({ user_id: user_id }, cleared_execute);
            final_result = (execute_result.acknowledged && cleared_result.acknowledged);
        }

        return final_result;
    }

    private async canUserGainExtraStamina(ans_duration, qns_max_time, duration_portion) {
        return (ans_duration / 1000 <= qns_max_time * duration_portion);
    }

    private async giveExtraStamina(interaction, gained_extra_stamina: number) {
        if (gained_extra_stamina < 2) {
            const ongoing_update = {
                $inc: {
                    "stamina.extra": 1,
                    "stamina.extra_gained": 1
                }
            };

            const main_statistics_update = {
                $inc: {
                    "personal_record.extra_stamina_gained_count": 1
                }
            };

            await (await this.ongoing_op.cursor_promise).updateOne({ user_id: interaction.user.id }, ongoing_update);
            await (await this.account_op.cursor_promise).updateOne({ user_id: interaction.user.id }, main_statistics_update);

            return {
                result: 'gave',
                gave: 1
            };

        } else {
            const execute = {
                $inc: {
                    exp: 10
                }
            };
            await (await this.account_op.cursor_promise).updateOne({ user_id: interaction.user.id }, execute);
            return {
                result: 'overflow',
                overflow_exp: 10
            }
        }
    }
}
