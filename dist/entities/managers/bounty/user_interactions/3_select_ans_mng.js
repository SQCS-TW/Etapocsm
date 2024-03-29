"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelectBountyAnswerManager = void 0;
const shortcut_1 = require("../../../shortcut");
const discord_js_1 = require("discord.js");
const utils_1 = require("./utils");
class SelectBountyAnswerManager extends shortcut_1.core.BaseManager {
    constructor(f_platform) {
        super();
        this.cache = new shortcut_1.db.Redis();
        this.qns_diffi_exp = {
            'easy': 10,
            'medium': 10 * 2,
            'hard': 10 * 3
        };
        this.qns_diffi_time = {
            'easy': 60,
            'medium': 60 * 2,
            'hard': 60 * 3
        };
        this.qns_ext_stamina_portion = {
            'easy': 1 / 4,
            'medium': 1 / 3,
            'hard': 1 / 3
        };
        this.f_platform = f_platform;
        this.setupListener();
    }
    setupListener() {
        this.f_platform.f_bot.on('ready', async () => {
            await this.cache.connect();
        });
        this.f_platform.f_bot.on('interactionCreate', async (interaction) => {
            if (interaction.isSelectMenu())
                await this.dropdownHandler(interaction);
        });
    }
    async dropdownHandler(interaction) {
        if (interaction.customId !== 'choose-bounty-answers')
            return;
        await interaction.deferReply();
        const delete_result = await (await this.f_platform.dropdown_op.cursor).findOneAndDelete({ user_id: interaction.user.id });
        if (!delete_result.ok) {
            shortcut_1.core.critical_logger.error({
                message: '[Bounty] 刪除玩家 ans-dp 驗證資訊時發生錯誤',
                metadata: {
                    player_id: interaction.user.id
                }
            });
            return await interaction.editReply('刪除驗證資訊時發生錯誤！');
        }
        const dp_data = delete_result.value;
        if (!dp_data)
            return await interaction.editReply('抱歉，我們找不到你的驗證資訊...');
        if (dp_data.msg_id !== interaction.message.id)
            return await interaction.editReply('抱歉，你好像選錯選錯選單了...');
        if (interaction.message instanceof discord_js_1.Message)
            await interaction.message.delete();
        const ongoing_data = await (await this.f_platform.ongoing_op.cursor).findOne({ user_id: interaction.user.id });
        const qns_msg = await interaction.channel.messages.fetch(ongoing_data.qns_msg_id);
        if (qns_msg instanceof discord_js_1.Message)
            await qns_msg.delete();
        const thread_data = (0, utils_1.getQnsThreadData)(ongoing_data.qns_thread);
        const qns_data = await this.getOrSetQnsCache(thread_data.curr_diffi, thread_data.curr_qns_number);
        const bounty_result_embed = new discord_js_1.MessageEmbed()
            .setTitle(`🚩｜你選擇了 ${interaction.values[0]}`)
            .setColor('#ffffff');
        const correct = this.isUserCorrect(interaction, qns_data.correct_ans);
        if (correct) {
            shortcut_1.core.normal_logger.info({
                message: '[Bounty] 玩家答題正確',
                metadata: {
                    player_id: interaction.user.id,
                    diffi: qns_data.difficulty,
                    number: qns_data.number
                }
            });
            bounty_result_embed.setDescription('恭喜，這是正確答案！');
        }
        else {
            shortcut_1.core.normal_logger.info({
                message: '[Bounty] 玩家答題錯誤',
                metadata: {
                    player_id: interaction.user.id,
                    diffi: qns_data.difficulty,
                    number: qns_data.number
                }
            });
            bounty_result_embed.setDescription('可惜，這不是正確答案');
        }
        const give_result = await this.giveExp(correct, thread_data.curr_diffi, interaction.user.id);
        if (give_result.status === shortcut_1.db.StatusCode.WRITE_DATA_SUCCESS)
            bounty_result_embed.addField('✨ 獲得經驗值', `**${give_result.delta_exp}** exp`, true);
        else {
            shortcut_1.core.critical_logger.error({
                message: '[Bounty] 給玩家經驗值時發生錯誤了',
                metadata: {
                    player_id: interaction.user.id,
                    delta_exp: give_result.delta_exp
                }
            });
            await interaction.channel.send(`給你 ${give_result.delta_exp} exp 時發生錯誤了！`);
        }
        let new_thread = undefined;
        if (correct) {
            const result = await this.updateQnsThread(interaction.user.id, ongoing_data.qns_thread, thread_data.curr_diffi);
            if (result.status === shortcut_1.db.StatusCode.WRITE_DATA_ERROR) {
                shortcut_1.core.critical_logger.error({
                    message: '[Bounty] 更新玩家問題串時發生錯誤',
                    metadata: {
                        player_id: interaction.user.id
                    }
                });
                await interaction.channel.send('更新問題串時發生錯誤');
            }
            new_thread = result.new_thread;
        }
        if (correct) {
            const can_gain_ext_stamina = await this.canUserGainExtraStamina(dp_data.ans_duration, this.qns_diffi_time[thread_data.curr_diffi], this.qns_ext_stamina_portion[thread_data.curr_diffi]);
            if (can_gain_ext_stamina) {
                const give_result = await this.giveExtraStamina(interaction, ongoing_data.stamina.extra_gained);
                if (give_result.result === 'gave')
                    bounty_result_embed.addField('⚡ 獲得額外體力', `${give_result.gave} 格`, true);
                else if (give_result.result === 'overflow')
                    bounty_result_embed.addField('⚡ 獲得額外體力', `可獲得數量已到上限\n自動轉為 **${give_result.overflow_exp}** exp`, true);
            }
        }
        await interaction.editReply({
            embeds: [bounty_result_embed]
        });
        const stat_result = await this.updateStatistics(interaction.user.id, correct, thread_data.curr_diffi, thread_data.curr_qns_number, new_thread);
        if (!stat_result) {
            shortcut_1.core.critical_logger.error({
                message: '[Bounty] 更新玩家統計數據時發生錯誤了',
                metadata: {
                    player_id: interaction.user.id
                }
            });
            return await interaction.channel.send('更新統計資料時發生錯誤');
        }
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
    isUserCorrect(interaction, correct_ans) {
        const user_choice = interaction.values[0].split(', ');
        const correct = shortcut_1.core.arrayEquals(user_choice, correct_ans);
        return correct;
    }
    async giveExp(correct, diffi, user_id) {
        const user_lvl_main_acc = await (await this.f_platform.mainlvl_acc_op.cursor).findOne({ user_id: user_id });
        const exp_multiplier = user_lvl_main_acc?.exp_multiplier ?? 1;
        let delta_exp;
        if (!correct)
            delta_exp = 2;
        else
            delta_exp = this.qns_diffi_exp[diffi];
        delta_exp = Math.round(delta_exp * exp_multiplier);
        const execute = {
            $inc: {
                exp: delta_exp
            }
        };
        const update_result = await (await this.f_platform.account_op.cursor).updateOne({ user_id: user_id }, execute);
        let status;
        if (update_result.acknowledged)
            status = shortcut_1.db.StatusCode.WRITE_DATA_SUCCESS;
        else
            status = shortcut_1.db.StatusCode.WRITE_DATA_ERROR;
        return {
            status: status,
            delta_exp: delta_exp
        };
    }
    async updateQnsThread(user_id, user_qns_thread, diffi) {
        user_qns_thread[diffi].shift();
        const execute = {
            $set: {
                [`qns_thread.${diffi}`]: user_qns_thread[diffi]
            }
        };
        const update_result = await (await this.f_platform.ongoing_op.cursor).updateOne({ user_id: user_id }, execute);
        let status;
        if (update_result.acknowledged)
            status = shortcut_1.db.StatusCode.WRITE_DATA_SUCCESS;
        else
            status = shortcut_1.db.StatusCode.WRITE_DATA_ERROR;
        return {
            status: status,
            new_thread: user_qns_thread
        };
    }
    async updateStatistics(user_id, correct, qns_diffi, qns_number, new_thread) {
        let execute;
        let cleared_execute = undefined;
        if (!correct) {
            execute = {
                $inc: {
                    [`qns_record.answered_qns_count.${qns_diffi}`]: 1
                }
            };
        }
        else {
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
                if (qns_diffi === 'hard')
                    thread_all_cleared_count++;
            }
            cleared_execute = {
                $inc: {
                    "personal_record.thread_cleared_count": thread_cleared_count,
                    "personal_record.thread_all_cleared_count": thread_all_cleared_count
                }
            };
        }
        let final_result;
        if (!cleared_execute) {
            const execute_result = await (await this.f_platform.account_op.cursor).updateOne({ user_id: user_id }, execute);
            final_result = execute_result.acknowledged;
        }
        else {
            const execute_result = await (await this.f_platform.account_op.cursor).updateOne({ user_id: user_id }, execute);
            const cleared_result = await (await this.f_platform.account_op.cursor).updateOne({ user_id: user_id }, cleared_execute);
            final_result = (execute_result.acknowledged && cleared_result.acknowledged);
        }
        return final_result;
    }
    async canUserGainExtraStamina(ans_duration, qns_max_time, duration_portion) {
        return (ans_duration / 1000 <= qns_max_time * duration_portion);
    }
    async giveExtraStamina(interaction, gained_extra_stamina) {
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
            await (await this.f_platform.ongoing_op.cursor).updateOne({ user_id: interaction.user.id }, ongoing_update);
            await (await this.f_platform.account_op.cursor).updateOne({ user_id: interaction.user.id }, main_statistics_update);
            return {
                result: 'gave',
                gave: 1
            };
        }
        else {
            const user_lvl_main_acc = await (await this.f_platform.mainlvl_acc_op.cursor).findOne({ user_id: interaction.user.id });
            const exp_multiplier = user_lvl_main_acc?.exp_multiplier ?? 1;
            const convert_exp = 10;
            const delta_exp = Math.round(convert_exp * exp_multiplier);
            const execute = {
                $inc: {
                    exp: delta_exp
                }
            };
            await (await this.f_platform.account_op.cursor).updateOne({ user_id: interaction.user.id }, execute);
            return {
                result: 'overflow',
                overflow_exp: delta_exp
            };
        }
    }
}
exports.SelectBountyAnswerManager = SelectBountyAnswerManager;
