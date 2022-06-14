import { AnyChannel, ButtonInteraction, Channel, CommandInteraction, DMChannel } from 'discord.js';
import { ACCOUNT_MANAGER_SLCMD, EVENT_MANAGER_SLCMD, START_BOUNTY_COMPONENTS, END_BOUNTY_COMPONENTS } from './components/user_interaction';
import { core, db } from '../../shortcut';
import { unlink } from 'fs';
import { ObjectId } from 'mongodb';
import cron from 'node-cron';
import { jsonOperator } from '../../../core/json';


export class BountyAccountManager extends core.BaseManager {
    private account_op: core.BountyUserAccountOperator;
    private ongoing_op: core.BountyUserOngoingInfoOperator;

    constructor(f_platform: core.BasePlatform) {
        super(f_platform);

        this.account_op = new core.BountyUserAccountOperator();
        this.ongoing_op = new core.BountyUserOngoingInfoOperator();

        this.SLCMD_REGISTER_LIST = ACCOUNT_MANAGER_SLCMD;

        this.setupListener();
    }

    private setupListener() {
        this.f_platform.f_bot.on('interactionCreate', async (interaction) => {
            if (interaction.isCommand()) await this.slcmdHandler(interaction);
        });
    }

    private async slcmdHandler(interaction: CommandInteraction) {

        switch (interaction.commandName) {
            case 'create-main-bounty-account': {
                await interaction.deferReply({ ephemeral: true });

                const exist_result = await this.account_op.checkDataExistence({ user_id: interaction.user.id });
                if (exist_result.status === db.StatusCode.DATA_FOUND) return await interaction.editReply('你已經建立過懸賞區主帳號了！');

                const create_result = await this.account_op.createDefaultData({ user_id: interaction.user.id });
                if (create_result.status === db.StatusCode.WRITE_DATA_ERROR) return await interaction.editReply('建立帳號時發生錯誤了！');
                else return await interaction.editReply('帳號建立成功！');
            }

            case 'check-main-bounty-account': {
                await interaction.deferReply({ ephemeral: true });

                const exist_result = await this.account_op.checkDataExistence({ user_id: interaction.user.id });
                if (exist_result.status === db.StatusCode.DATA_NOT_FOUND) return await interaction.editReply('你還沒建立過懸賞區主帳號！');

                const user_account = await (await this.account_op.cursor_promise).findOne({ user_id: interaction.user.id });
                return await interaction.editReply(JSON.stringify(user_account, null, "\t"));
            }

            case 'check-bounty-ongoing-info': {
                await interaction.deferReply({ ephemeral: true });

                const exist_result = await this.ongoing_op.checkDataExistence({ user_id: interaction.user.id });
                if (exist_result.status === db.StatusCode.DATA_NOT_FOUND) return await interaction.editReply('你還沒開啟過懸賞區！');

                const user_ongoing_info = await (await this.ongoing_op.cursor_promise).findOne({ user_id: interaction.user.id });
                return await interaction.editReply(JSON.stringify(user_ongoing_info, null, "\t"));
            }
        }
    }
}

type QnsThread = {
    easy: number[],
    medium: number[],
    hard: number[]
}

class QnsThreadBeautifier {
    private len_to_emoji: object;
    private diffi_to_emoji: object;
    private ban_repeat: number;
    private ban_line: string;
    private ban_left: string;
    private ban_right: string;

    constructor() {
        this.len_to_emoji = {
            2: '🔒 ║ ❓',
            3: '🔒 ║ ❓ × 2️⃣'
        }

        this.diffi_to_emoji = {
            'easy': '🟩',
            'medium': '🟧',
            'hard': '🟥'
        }

        this.ban_repeat = 4;
        this.ban_line = '═';
        this.ban_left = '╣';
        this.ban_right = '╠';
    }

    async beautify(thread: QnsThread): Promise<string> {
        const text: string[] = [];

        let previous_comp = true;
        const diffi_list = ['easy', 'medium', 'hard'];

        for (let i = 0; i < diffi_list.length; i++) {
            const diffi = diffi_list[i];

            const long_line = this.ban_line.repeat(this.ban_repeat);
            const banner = `${long_line}${this.ban_left} ${this.diffi_to_emoji[diffi]} ${this.ban_right}${long_line}`;
            text.push(banner);

            const thread_len = thread[diffi].length;
            if (thread_len > 0 && previous_comp) {
                previous_comp = false;

                text.push("👉 ║ ❓");
                if (thread_len > 1) text.push(this.len_to_emoji[thread_len]);

            } else if (thread_len > 0 || !previous_comp) {
                text.push('🔒');
            } else {
                text.push('✅');

                previous_comp = true;
            }

            if (diffi !== 'hard') text.push('\n');
        }
        return text.join('\n');
    }
}

const qns_thread_beauty = new QnsThreadBeautifier();

export class BountyEventManager extends core.BaseManager {
    private account_op: core.BountyUserAccountOperator;
    private ongoing_op: core.BountyUserOngoingInfoOperator;

    private start_button_op: core.BaseOperator;
    private end_button_op: core.BaseOperator;

    private qns_diffi_time: object;

    constructor(f_platform: core.BasePlatform) {
        super(f_platform);

        this.account_op = new core.BountyUserAccountOperator();
        this.ongoing_op = new core.BountyUserOngoingInfoOperator();

        this.SLCMD_REGISTER_LIST = EVENT_MANAGER_SLCMD;

        this.qns_diffi_time = {
            'easy': 60,
            'medium': 60 * 2,
            'hard': 60 * 3
        }

        this.setupListener();

        this.start_button_op = new core.BaseOperator({
            db: 'Bounty',
            coll: 'StartButtonPipeline'
        });

        this.end_button_op = new core.BaseOperator({
            db: 'Bounty',
            coll: 'EndButtonPipeline'
        });
    }

    private setupListener() {
        this.f_platform.f_bot.on('interactionCreate', async (interaction) => {
            if (interaction.isCommand()) await this.slcmdHandler(interaction);
            else if (interaction.isButton()) await this.buttonHandler(interaction);
        });
    }

    private async slcmdHandler(interaction: CommandInteraction) {

        switch (interaction.commandName) {
            case 'start-bounty': {
                await interaction.deferReply({ ephemeral: true });

                const check_main_acc = await this.account_op.checkDataExistence({ user_id: interaction.user.id });
                if (check_main_acc.status === db.StatusCode.DATA_NOT_FOUND) return await interaction.editReply('請先建立你的懸賞區資料！');

                const user_acc = await (await this.account_op.cursor_promise).findOne({ user_id: interaction.user.id });
                if (!user_acc.auth) return await interaction.editReply('你沒有遊玩懸賞區的權限！');

                const create_result = await SB_functions.autoCreateAndGetOngoingInfo(interaction.user.id, {
                    account_op: this.account_op,
                    ongoing_op: this.ongoing_op
                });

                if (create_result.status === db.StatusCode.WRITE_DATA_ERROR) return await interaction.editReply('創建問題串失敗！');
                else if (create_result.status === db.StatusCode.WRITE_DATA_SUCCESS) await interaction.editReply('問題串已建立！');

                const beautified_qns_thread = await qns_thread_beauty.beautify(create_result.qns_thread);
                await interaction.followUp(`你的答題狀態：\n\n${beautified_qns_thread}`);

                const qns_data = await SB_functions.getQnsThreadData(create_result.qns_thread);

                if (qns_data.finished) return await interaction.followUp('你已經回答完所有問題了！');

                // ==== modify embed -> set difficulty and qns_number
                const new_embed = await this.getModifiedEmbed(qns_data.curr_diffi, qns_data.curr_qns_number);

                const msg = await interaction.user.send({
                    components: [START_BOUNTY_COMPONENTS.button],
                    embeds: [new_embed]
                });

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

                const new_button = await common_functions.getDisabledButton(START_BOUNTY_COMPONENTS.button);

                await msg.edit({
                    components: [new_button],
                    embeds: [new_embed]
                });
                return;
            }
        }
    }

    private async getModifiedEmbed(diffi: string, qns_number: number) {
        const new_embed = await core.cloneObj(START_BOUNTY_COMPONENTS.embed);
        new_embed.fields[0].value = diffi;
        new_embed.fields[1].value = qns_number.toString();
        return new_embed;
    }

    private async buttonHandler(interaction: ButtonInteraction) {
        console.log(interaction.channelId);
        switch (interaction.customId) {
            case 'start_bounty': {
                await interaction.deferReply();

                const user_btn_data = await (await this.start_button_op.cursor_promise).findOne({ user_id: interaction.user.id });
                if (!user_btn_data) return await interaction.editReply('錯誤，找不到驗證資訊');
                else if (user_btn_data.msg_id !== interaction.message.id) return await interaction.editReply('驗證資訊錯誤');

                const diffi = user_btn_data.qns_info.difficulty;
                const qns_number = user_btn_data.qns_info.number;

                const new_embed = await this.getModifiedEmbed(diffi, qns_number);
                const new_button = await common_functions.getDisabledButton(START_BOUNTY_COMPONENTS.button);

                const msg: any = interaction.message;
                await msg.edit({
                    components: [new_button],
                    embeds: [new_embed]
                });

                const delete_result = await (await this.start_button_op.cursor_promise).deleteOne({ user_id: interaction.user.id });
                if (!delete_result.acknowledged) return await interaction.editReply('刪除驗證資訊時發生錯誤！');

                // download qns pic
                const local_file_name = `./cache/qns_pic_dl/${interaction.user.id}_${qns_number}.png`;
                const dl_result = await db.storjDownload({
                    bucket_name: 'bounty-questions-db',
                    local_file_name: local_file_name,
                    db_file_name: `${diffi}/${qns_number}.png`
                });
                if (!dl_result) return await interaction.user.send('下載圖片錯誤！');

                const buffer_time = 3;
                const process_delay_time = 1;

                const start_time = Date.now() + (buffer_time + process_delay_time + 1) * 1000;
                const end_time = Date.now() + (this.qns_diffi_time[diffi] + buffer_time + process_delay_time + 1) * 1000;
                const execute = {
                    $set: {
                        //status: true
                    }
                }
                const update_result = await (await this.ongoing_op.cursor_promise).updateOne({ user_id: interaction.user.id }, execute);
                if (!update_result.acknowledged) {
                    unlink(local_file_name, () => { return; });
                    return await interaction.user.send('開始懸賞時發生錯誤！');
                }

                const relativeDiscordTimestamp = (t: number) => { return `<t:${Math.trunc(t / 1000)}:R>`; };
                await interaction.editReply(`開始時間：${relativeDiscordTimestamp(start_time)}\n結束時間：${relativeDiscordTimestamp(end_time)}`);

                await core.sleep(1);

                const del_msg = await interaction.user.send(`倒數 ${buffer_time} 秒後傳送問題圖片`);
                await core.sleep(buffer_time);
                await del_msg.delete();

                await interaction.user.send({
                    content: '**【題目】**注意，請勿將題目外流給他人，且答題過後建議銷毀。',
                    files: [local_file_name]
                });
                unlink(local_file_name, () => { return; });

                const btn_msg = await interaction.user.send({
                    components: [END_BOUNTY_COMPONENTS.button]
                });

                const end_btn_info = {
                    _id: new ObjectId(),
                    user_id: interaction.user.id,
                    channel_id: interaction.channelId,
                    msg_id: btn_msg.id,
                    time: {
                        start: start_time,
                        end: end_time,
                        duration: -1
                    }
                }
                const create_result = await (await this.end_button_op.cursor_promise).insertOne(end_btn_info);
                if (!create_result.acknowledged) return await interaction.user.send('建立結束資料時發生錯誤！');

                break;
            }
        }
    }
}

const SB_functions = {
    async autoCreateAndGetOngoingInfo(user_id: string, ops) {
        const data_exists = await ops.ongoing_op.checkDataExistence({ user_id: user_id });
        if (data_exists.status === db.StatusCode.DATA_FOUND) {
            const user_ongoing_info = await (await ops.ongoing_op.cursor_promise).findOne({ user_id: user_id });

            return {
                status: data_exists.status,
                qns_thread: user_ongoing_info.qns_thread
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
    },

    async createQnsThread(user_id: string, ops) {
        const user_main_acc = await (await ops.account_op.cursor_promise).findOne({ user_id: user_id });

        const db_cache_operator = new core.BaseOperator({
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
    },

    async getQnsThreadData(qns_thread: QnsThread) {
        const diffi_list = ['easy', 'medium', 'hard'];

        let curr_diffi: string;
        let curr_qns_number: number;
        for (let i = 0; i < diffi_list.length; i++) {
            const diffi = diffi_list[i];
            if (qns_thread[diffi].length === 0) continue;

            curr_diffi = diffi;
            curr_qns_number = qns_thread[diffi][0];
            break;
        }
        if (curr_diffi === undefined) return {
            finished: true
        };

        return {
            finished: false,
            curr_diffi: curr_diffi,
            curr_qns_number: curr_qns_number
        };
    }
}

const common_functions = {
    async getDisabledButton(obj: object) {
        const new_button = await core.cloneObj(obj);
        new_button.components[0].disabled = true;
        return new_button;
    }
}

type pipeline = {
    cache: UserCache[]
}

type UserCache = {
    user_id: string,
    end_time: number
}

export class BountyEventAutoManager extends core.BaseManager {
    private json_op: core.jsonOperator;
    private ongoing_op: core.BountyUserOngoingInfoOperator;

    private end_button_op: core.BaseOperator;

    private cache_path: string;

    constructor(f_platform: core.BasePlatform) {
        super(f_platform);

        this.json_op = new jsonOperator();
        this.ongoing_op = new core.BountyUserOngoingInfoOperator();

        this.end_button_op = new core.BaseOperator({
            db: 'Bounty',
            coll: 'EndButtonPipeline'
        });

        cron.schedule('*/15 * * * * *', async () => { await this.setupCache() });
        cron.schedule('*/2 * * * * *', async () => { await this.checkCache() });

        this.cache_path = './cache/bounty/player_data.json';
    }

    private async checkCache() {
        const cache_data: pipeline = await this.json_op.readFile(this.cache_path);

        if (cache_data.cache.length === 0) return;

        console.log('cache found', cache_data);

        // eslint-disable-next-line no-constant-condition
        while (true) {
            if (cache_data.cache.length === 0) break;

            const user_cache = cache_data.cache[0];

            if (user_cache.end_time > Date.now()) break;

            const end_btn_data = await (await this.end_button_op.cursor_promise).findOne({ user_id: user_cache.user_id });
            
            if (end_btn_data) {
                const channel: AnyChannel = await this.f_platform.f_bot.channels.fetch(end_btn_data.channel_id);
                if (!(channel instanceof DMChannel)) continue;

                const msg = await channel.messages.fetch(end_btn_data.msg_id);
                const new_button = await common_functions.getDisabledButton(END_BOUNTY_COMPONENTS.button);
                await msg.edit({
                    components: [new_button]
                });
            }
            
            cache_data.cache.shift();
            await (await this.end_button_op.cursor_promise).deleteOne({ user_id: user_cache.user_id });
        }

        console.log('modify', cache_data);

        await this.json_op.writeFile(this.cache_path, cache_data);
    }

    private async setupCache() {
        const cache_data: pipeline = await this.json_op.readFile(this.cache_path);
        const cached_user_id: string[] = [];
        
        if (cache_data.cache.length !== 0) {
            for(let i = 0; i < cache_data.cache.length; i++) {
                cached_user_id.push(cache_data.cache[i].user_id);
            }
        }

        const end_btn_data = await (await this.end_button_op.cursor_promise).find({}).toArray();
        
        for (let i = 0; i < end_btn_data.length; i++) {
            const data = end_btn_data[i];

            if (data.time.end > Date.now() + 150 * 1000) continue;
            
            if(await core.isItemInArray(data.user_id, cached_user_id)) continue;


            cache_data.cache.push({
                user_id: data.user_id,
                end_time: data.time.end
            });

            console.log('pushed', {
                user_id: data.user_id,
                end_time: data.time.end
            });
        }

        cache_data.cache.sort((a, b) => a.end_time - b.end_time);
        await this.json_op.writeFile(this.cache_path, cache_data);


        return;
    }
}

// import fs from 'fs';
// import { ObjectId } from 'mongodb';

// import { core, db } from '../../sc';

// import { CommandInteraction, SelectMenuInteraction } from 'discord.js'

// import {
//     START_SLCMD_REGISTER_LIST,
//     END_SLCMD_REGISTER_LIST,
//     CHOOSE_BOUNTY_DIFFICULTY_DROPDOWN,
//     CHOOSE_BOUNTY_ANS_DROPDOWN
// } from './constants/user_interaction';


// class BountyStartEventManager extends core.BaseManager {
//     private bounty_bounty_account_op: core.BountyAccountOperator;
//     private inter_appli_op: core.InteractionPipelineOperator;

//     constructor(father_platform: core.BasePlatform) {
//         super(father_platform);

//         this.bounty_bounty_account_op = new core.BountyAccountOperator();
//         this.inter_appli_op = new core.InteractionPipelineOperator();

//         this.slcmd_reglist = START_SLCMD_REGISTER_LIST;
//     }

//     private async handleActivateBountyCase(interaction: CommandInteraction) {
//         await interaction.deferReply({ ephemeral: true });

//         // check if the user is already answering questions:
//         let check_result = await this.bounty_bounty_account_op.checkUserDataExistence(interaction.user.id);

//         if (check_result.status) {
//             if (await this.bounty_bounty_account_op.isUserAnsweringQns(interaction.user.id)) {
//                 return await interaction.editReply({
//                     content: ':x:**【啟動錯誤】**你已經在回答問題中了！'
//                 });
//             }
//         } else {
//             const create_result = await this.bounty_bounty_account_op.createUserData(interaction.user.id);
//             if (!create_result) return await interaction.editReply(create_result.message);
//         }

//         check_result = await this.inter_appli_op.checkUserApplicationExistence(interaction.user.id, 'choose_bounty_qns_difficulty');
//         if (check_result.status) return await interaction.editReply({
//             content: ':x:**【申請錯誤】**請勿重複申請！'
//         });

//         await interaction.editReply({
//             content: ':white_check_mark:**【帳號檢查完畢】**活動開始！'
//         });

//         await interaction.followUp({
//             content: '請選擇問題難度（限時 15 秒）',
//             components: CHOOSE_BOUNTY_DIFFICULTY_DROPDOWN,
//             ephemeral: true
//         });

//         const player_appli = await this.inter_appli_op.createApplication(interaction.user.id, 'choose_bounty_qns_difficulty', 15);

//         if (!player_appli.status) return await interaction.followUp({
//             content: ':x:**【選單申請創建錯誤】**請洽總召！',
//             files: this.error_gif,
//             ephemeral: true
//         });
//     }
// }


// class BountyEndEventManager extends core.BaseManager {
//     private bounty_account_op: core.BountyAccountOperator;

//     constructor(father_platform: core.BasePlatform) {
//         super(father_platform);

//         this.bounty_account_op = new core.BountyAccountOperator();
//         this.slcmd_reglist = END_SLCMD_REGISTER_LIST;
//     }

//     private async slCmd_endBounty(interaction: CommandInteraction) {
//         await interaction.deferReply({ ephemeral: true });

//         let check_result = await this.bounty_account_op.checkUserDataExistence(interaction.user.id);
//         if (!check_result.status) return await interaction.editReply({
//             content: ':x:**【帳號錯誤】**你還沒啟動過活動！'
//         });

//         check_result = await this.bounty_account_op.isUserAnsweringQns(interaction.user.id);

//         if (!check_result.status) return await interaction.editReply({
//             content: ':x:**【狀態錯誤】**你還沒啟動過活動！'
//         });

//         const ongoing_cursor = await (new db.Mongo('Bounty')).getCur('OngoingPipeline');
//         const qns_cursor = await (new db.Mongo('Bounty')).getCur('Questions');

//         const ongoing_data = await ongoing_cursor.findOne({ user_id: interaction.user.id });
//         const qns_data = await qns_cursor.findOne({ qns_id: ongoing_data.qns_id });

//         const choices: Array<string> = await this.generateQuestionChoices(qns_data.choices, qns_data.ans);

//         const ans_dropdown = [await core.cloneObj(CHOOSE_BOUNTY_ANS_DROPDOWN[0])];

//         choices.forEach(item => {
//             ans_dropdown[0].components[0].options.push({
//                 label: item,
//                 value: item
//             });
//         });

//         await interaction.editReply({
//             content: '請選擇答案（限時 1 分鐘）',
//             components: ans_dropdown
//         });

//         const player_application: db.MongoData = {
//             _id: new ObjectId(),
//             user_id: interaction.user.id,
//             type: 'choose_bounty_ans',
//             due_time: (await core.timeAfterSecs(60))
//         };

//         const interaction_cursor = await (new db.Mongo('Interaction')).getCur('Pipeline');
//         const apply_result = await interaction_cursor.insertOne(player_application);
//         if (!apply_result.acknowledged) {
//             await interaction.followUp({
//                 content: ':x:**【選單申請創建錯誤】**請洽總召！',
//                 files: this.error_gif,
//                 ephemeral: true
//             });

//             return;
//         }
//     }

//     private async slCmd_setStatus(interaction: CommandInteraction) {
//         if (!this.checkPerm(interaction, 'ADMINISTRATOR')) {
//             return await interaction.reply(this.perm_error);
//         }

//         await interaction.deferReply({ ephemeral: true });

//         const user_id: string = interaction.options.getString('user_id');
//         const new_status: boolean = interaction.options.getBoolean('status');

//         const set_result = await this.bounty_account_op.setStatus(user_id, new_status);

//         await interaction.editReply(set_result.message);
//     }

//     public async slcmdHandler(interaction: CommandInteraction) {
//         // only receive messages from the bounty-use channel
//         // currently use cmd-use channel for testing
//         if (interaction.channel.id !== '743677861000380527') return;

//         switch (interaction.commandName) {
//             case 'activate_bounty': {
//                 await this.slCmd_activateBounty(interaction);
//                 break;
//             }

//             case 'end_bounty': {
//                 await this.slCmd_endBounty(interaction);
//                 break;
//             }

//             case 'set_status': {
//                 await this.slCmd_setStatus(interaction);
//                 break;
//             }
//         }
//     }

//     private async dd_chooseBountyQnsDifficulty(interaction: SelectMenuInteraction) {
//         await interaction.deferReply({ ephemeral: true });

//         // check if there's exists such an application:
//         const verify = {
//             user_id: interaction.user.id,
//             type: "choose_bounty_qns_difficulty"
//         };
//         if (!(await core.verifyMenuApplication(verify))) {
//             await interaction.editReply({
//                 content: ':x:**【選單認證錯誤】**選單已經逾期；或是請勿重複選擇。',
//                 files: this.error_gif
//             });
//             return;
//         }
//         //

//         // fetch qns picture:
//         // comes in forms of 'easy', 'medium', 'hard'
//         const diffi = interaction.values[0];

//         const dl_result = await this.downloadQnsPicture(diffi);
//         if (!dl_result.status) {
//             await interaction.followUp({
//                 content: ':x:**【題目獲取錯誤】**請洽總召！',
//                 files: this.error_gif,
//                 ephemeral: true
//             });
//             return;
//         }
//         //

//         // send picture and delete local picture:
//         await interaction.followUp({
//             content: '**【題目】**注意，請將題目存起來，這則訊息將在一段時間後消失。\n但請勿將題目外流給他人，且答題過後建議銷毀。',
//             files: [dl_result.local_file_name],
//             ephemeral: true
//         });

//         fs.unlink(dl_result.local_file_name, () => { return; });
//         //

//         const append_result = await this.appendToPipeline(diffi, dl_result.random_filename, interaction.user.id);
//         if (!append_result.result) {
//             await interaction.followUp(append_result.message);
//             return;
//         }

//         const active_result = await this.activePayerStatus(interaction.user.id);
//         if (!active_result.result) {
//             await interaction.followUp(active_result.message);
//             return;
//         }
//     }

//     public async dropdownHandler(interaction: SelectMenuInteraction) {
//         // only receive messages from the bounty-use channel
//         // currently use cmd-use channel for testing
//         if (interaction.channel.id !== '743677861000380527') return;

//         switch (interaction.customId) {
//             case 'choose_bounty_qns_difficulty': {
//                 await this.dd_chooseBountyQnsDifficulty(interaction);
//                 break;
//             }

//             case 'choose_bounty_ans': {
//                 break;
//             }
//         }
//     }

//     private async generateQuestionChoices(qns_choices: Array<string>, qns_ans: Array<string>) {
//         // ex:
//         //     qns_choices = ['A', 'B', 'C', 'D', 'E', 'F'];
//         //     qns_ans = ['A', 'C'];

//         let result: Array<any> = await core.getSubsetsWithCertainLength(qns_choices, qns_ans.length);
//         result = result.filter(async (item) => { return (!(await core.arrayEquals(item, qns_ans))) });
//         result = await core.shuffle(result);

//         const random_choices_count = Math.min(
//             Math.pow(2, qns_ans.length) + 2,
//             await core.binomialCoefficient(qns_choices.length, qns_ans.length)
//         ) - 1;

//         result = result.slice(0, random_choices_count);
//         result.push(qns_ans);
//         result = await core.shuffle(result);
//         result = result.map((item) => { return item.join(', ') });
//         return result;
//     }

//     private async downloadQnsPicture(diffi: string) {
//         const files = await db.getFolderFiles({
//             bucket_name: 'bounty-questions-db',
//             prefix: `${diffi}/`,
//             suffixes: '.png-.jpg'
//         });
//         console.log(files);
//         const random_filename = files[await core.getRandomInt(files.length)];
//         const local_file_name = `./assets/buffer/storj/${random_filename}`;

//         const result = await db.storjDownload({
//             bucket_name: 'bounty-questions-db',
//             local_file_name: local_file_name,
//             db_file_name: `${diffi}/${random_filename}`
//         });

//         return {
//             status: result,
//             random_filename: random_filename,
//             local_file_name: local_file_name
//         };
//     }

//     private async appendToPipeline(diffi: string, random_filename: string, player_id: string) {
//         const qns_cursor = await (new db.Mongo('Bounty')).getCur('Questions');

//         const qns_id = random_filename
//             .replace(".png", '')
//             .replace(".jpg", '');

//         const qns_data = await qns_cursor.findOne({ qns_id: qns_id });

//         const player_data = {
//             _id: new ObjectId(),
//             user_id: player_id,
//             difficulty: diffi,
//             qns_id: qns_id,
//             due_time: await core.timeAfterSecs(qns_data.time_avail),
//             freeze: false
//         };

//         const pipeline_cursor = (new db.Mongo('Bounty')).getCur('OngoingPipeline');
//         const ongoing_data_insert_result = await (await pipeline_cursor).insertOne(player_data);

//         if (!ongoing_data_insert_result.acknowledged) {
//             return {
//                 status: false,
//                 message: {
//                     content: ':x:**【活動檔案建立錯誤】**請洽總召！',
//                     files: this.error_gif,
//                     ephemeral: true
//                 }
//             };
//         }

//         return {
//             result: true
//         };
//     }

//     private async activePayerStatus(player_id: string) {
//         const set_result = await this.bounty_account_op.setStatus(player_id, true);

//         if (!set_result.status) return {
//             result: false,
//             message: {
//                 content: ':x:**【個人狀態啟動錯誤】**請洽總召！',
//                 files: this.error_gif,
//                 ephemeral: true
//             }
//         };

//         return {
//             result: true
//         };
//     }
// }