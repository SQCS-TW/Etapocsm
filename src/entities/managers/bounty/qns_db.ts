import { CommandInteraction, Message } from 'discord.js';
import { REGISTER_LIST } from './components/qns_db';
import { core, db } from '../../shortcut';
import { unlink } from 'fs';
import { BountyPlatform } from '../../platforms/bounty';


export class BountyQnsDBManager extends core.BaseManager {
    public f_platform: BountyPlatform;

    constructor(f_platform: BountyPlatform) {
        super();
        this.f_platform = f_platform;

        this.setupListener();

        this.slcmd_register_options = {
            guild_id: [core.GuildId.MAIN, core.GuildId.CADRE],
            cmd_list: REGISTER_LIST
        };
    }

    private setupListener() {
        this.f_platform.f_bot.on('interactionCreate', async (interaction) => {
            if (!interaction.inGuild() || interaction.guildId !== '980630152872615937') return;
            if (!core.discord.memberHasRole(interaction.member, ['教學組', '總召'])) return;

            if (interaction.isCommand()) await this.slcmdHandler(interaction);
        });

        this.f_platform.f_bot.on('messageCreate', async (msg: Message) => {
            if (msg.member?.permissions?.any('ADMINISTRATOR')) await this.messageHandler(msg);
        })
    }

    private async slcmdHandler(interaction: CommandInteraction) {

        switch (interaction.commandName) {
            case 'create-bounty-qns': {
                await interaction.deferReply();

                // get input data
                const inner_values = await CBQ_functions.getInputData(interaction);
                const diffi: string = inner_values.diffi;
                const max_choices: number = inner_values.max_choices;
                const correct_ans: string[] = inner_values.correct_ans;

                // create operator
                const db_cache_operator = new core.BaseMongoOperator({
                    db: 'Bounty',
                    coll: 'StorjQnsDBCache'
                });

                // check cache
                // if not exist -> create cache
                await CBQ_functions.checkAndAutoCreateCache(interaction, diffi, db_cache_operator.cursor);

                // refresh cache
                const refresh_cache = await (await db_cache_operator.cursor).findOne({ type: 'cache' });

                // update current diffi cache --> update when finished upload pic
                const qns_and_update_data = await CBQ_functions.getQnsNumber(refresh_cache, diffi);

                // get the picture that will be uploaded to storj
                let collected;
                try {
                    await interaction.editReply('請上傳問題圖片（限時60秒）');
                    const filter = m => m.author.id === interaction.user.id;

                    collected = await interaction.channel.awaitMessages({
                        filter: filter,
                        max: 1,
                        time: 60000,
                        errors: ['time']
                    });
                } catch {
                    return await interaction.editReply('上傳圖片過時');
                }

                const pic = collected.first().attachments.first();
                if (!pic) return await interaction.followUp('此並非圖片格式，請重新執行指令');

                const pic_url: string = pic.url;
                // if (!pic_url.endsWith('.png')) return await interaction.followUp('此圖片並非.png檔，請重新執行指令');

                const upload_status = await CBQ_functions.downloadAndUploadPic(pic_url, diffi, qns_and_update_data.qns_number);

                if (upload_status) await interaction.followUp('圖片已上傳！');
                else return await interaction.followUp('圖片上傳錯誤');

                // create qns info in mdb
                const create_params = {
                    difficulty: diffi,
                    qns_number: qns_and_update_data.qns_number,
                    max_choices: max_choices,
                    correct_ans: correct_ans
                }
                const create_result = await this.f_platform.qns_op.createDefaultData(create_params);
                if (create_result.status === db.StatusCode.WRITE_DATA_ERROR) return await interaction.followUp('error creating qns info');
                else {
                    await interaction.followUp('問題資料已建立！');
                    await interaction.channel.send(JSON.stringify(create_params, null, "\t"));
                }

                const mani_log_create_result = await CBQ_functions.createManipulationLog(interaction, Date.now(), diffi, qns_and_update_data.qns_number);
                if (!mani_log_create_result) return await interaction.followUp('error creating mani logs');

                // update storj cache
                const update_result = await (await db_cache_operator.cursor).updateOne({ type: 'cache' }, qns_and_update_data.execute);
                if (!update_result.acknowledged) return await interaction.followUp('error updating cache');
                else return;
            }

            case 'edit-bounty-qns-max-choices': {
                await interaction.deferReply();

                // get input data
                const inner_values = await EBQMC_functions.getInputData(interaction);
                const diffi: string = inner_values.diffi;
                const qns_number: number = inner_values.qns_number;
                const new_max_choices: number = inner_values.new_max_choices;

                const update_result = await this.f_platform.qns_op.setMaxChoices(diffi, qns_number, new_max_choices);
                if (update_result.status === db.StatusCode.DATA_NOT_FOUND) return await interaction.editReply('目標問題不存在！');

                if (update_result.status === db.StatusCode.WRITE_DATA_ERROR) return await interaction.editReply('更改錯誤！');
                else return await interaction.editReply('更改完成！');
            }

            case 'edit-bounty-qns-answers': {
                await interaction.deferReply();

                // get input data
                const inner_values = await EBQA_functions.getInputData(interaction);
                const diffi: string = inner_values.diffi;
                const qns_number: number = inner_values.qns_number;
                const new_answers: string[] = inner_values.new_answers;

                const update_result = await this.f_platform.qns_op.setCorrectAns(diffi, qns_number, new_answers);
                if (update_result.status === db.StatusCode.DATA_NOT_FOUND) return await interaction.editReply('目標問題不存在！');

                if (update_result.status === db.StatusCode.WRITE_DATA_ERROR) return await interaction.editReply('更改錯誤！');
                else return await interaction.editReply('更改完成！');
            }

            case 'log-create-bounty-qns-actions': {
                await interaction.deferReply();

                const logs = await (await LCBQA_functions.getLogs(interaction.user.id)).toArray();

                if (logs.length === 0) return await interaction.editReply('沒有任何紀錄！');

                const logs_prettify = [];
                for (let i = 0; i < logs.length; i++) {
                    const log = logs[i];

                    const finish_time_prettify = (new Date(log.finish_time)).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });
                    logs_prettify.push(`時間：${finish_time_prettify}\n題目難度：${log.qns_info.difficulty}\n題目編號：${log.qns_info.number}`);
                }

                while (logs_prettify.length > 0) {
                    await interaction.channel.send(logs_prettify.slice(0, 5).join('\n'));
                    logs_prettify.splice(0, 5);
                    await core.sleep(1);
                }

                return await interaction.editReply('輸出完畢！');
            }

            case 'del-create-bounty-qns-action': {
                await interaction.deferReply();

                const inner_values = await DCBQA_functions.getInputData(interaction);
                const diffi = inner_values.diffi;
                const qns_number = inner_values.qns_number;

                const logs_operator = new core.BaseMongoOperator({
                    db: 'Bounty',
                    coll: 'AdminLogs'
                });

                const search_result = await DCBQA_functions.getLog(
                    interaction.user.id,
                    diffi,
                    qns_number,
                    logs_operator.cursor
                );
                if (search_result.status === db.StatusCode.DATA_NOT_FOUND) {
                    return await interaction.editReply('找不到此操作；或是此操作不來自你');
                } else {
                    await interaction.editReply('已找到資料，進行刪除中...');
                }

                const delete_result = await db.storjDeleteFile({
                    bucket_name: 'bounty-questions-db',
                    delete_path: `${diffi}/${qns_number}.png`
                });
                if (!delete_result) return await interaction.editReply('刪除題目圖片出錯');

                const del_qns_info_result = await (await this.f_platform.qns_op.cursor).deleteOne({
                    difficulty: diffi,
                    number: qns_number
                });
                if (!del_qns_info_result.acknowledged) return await interaction.editReply('刪除題目資訊出錯');

                const del_log_result = await (await logs_operator.cursor).deleteOne({
                    accessor: interaction.user.id,
                    "qns_info.difficulty": diffi,
                    "qns_info.number": qns_number
                });
                if (!del_log_result.acknowledged) return await interaction.editReply('刪除操作紀錄出錯');
                else await interaction.followUp('刪除成功！');
            }
        }
    }

    private async messageHandler(msg: Message) {
        // switch (msg.content) {
        // }
    }
}

const CBQ_functions = {
    async getInputData(interaction: CommandInteraction) {
        const correct_ans: string[] = interaction.options.getString('correct-ans').split(";");

        // a -> A; b -> B; ...
        for (let i = 0; i < correct_ans.length; i++) {
            correct_ans[i] = correct_ans[i].toUpperCase();
        }

        return {
            diffi: interaction.options.getString('difficulty'),
            max_choices: interaction.options.getInteger('max-choices'),
            correct_ans: correct_ans
        }
    },

    async checkAndAutoCreateCache(interaction: CommandInteraction, diffi: string, cursor) {
        const exist_cache = await (await cursor).findOne({ type: 'cache' });

        if (!exist_cache) {
            const create_cache = await CBQ_functions.createQnsInfoCache(['easy', 'medium', 'hard']);

            const create_result = await (await cursor).insertOne(create_cache);
            if (!create_result.acknowledged) return await interaction.editReply('error creating cache');
        } else {
            const create_cache = await CBQ_functions.createQnsInfoCache([diffi]);

            const execute = {
                $set: {
                    [diffi]: create_cache[diffi]
                }
            }
            const update_result = await (await cursor).updateOne({ type: 'cache' }, execute);
            if (!update_result.acknowledged) return await interaction.editReply('error updating cache');
        }
    },

    async createQnsInfoCache(diffi_list: string[]) {
        const new_cache = {
            type: 'cache',
            easy: undefined,
            medium: undefined,
            hard: undefined
        };

        await core.asyncForEach(diffi_list, async (diffi) => {
            const file_names = await db.storjGetFolderFiles({
                bucket_name: 'bounty-questions-db',
                prefix: `${diffi}/`,
                suffixes: '.png'
            });

            let max_number = undefined;
            let skipped_numbers = undefined;

            if (file_names.length === 1 && file_names[0] === '') {
                max_number = -1;
                skipped_numbers = [];
            } else {
                for (let i = 0; i < file_names.length; i++) {
                    file_names[i] = Number(file_names[i].replace(".png", '')); // 0.png -> 0; 1.png -> 1
                }
                max_number = Math.max(...file_names);
                file_names.sort((a, b) => a - b);

                skipped_numbers = await this.checkMissingNumber(file_names);
            }

            new_cache[diffi] = {
                max_number: max_number,
                skipped_numbers: skipped_numbers
            }
        });

        return new_cache;
    },

    async checkMissingNumber(arr: Array<number>) {
        let curr_num = 0;
        let ind = 0;
        const missing = [];
        while (ind < arr.length) {
            if (arr[ind] !== curr_num) missing.push(curr_num);
            else ind++;

            curr_num++;
        }
        return missing;
    },

    async getQnsNumber(cache: object, diffi: string) {
        let qns_number: number;
        let execute: object;
        const diffi_info = cache[diffi];
        if (diffi_info.skipped_numbers.length !== 0) {
            qns_number = diffi_info.skipped_numbers[0];
            diffi_info.skipped_numbers.shift();

            execute = {
                $set: {
                    [diffi + ".skipped_numbers"]: diffi_info.skipped_numbers
                }
            }
        } else {
            qns_number = diffi_info.max_number + 1;
            diffi_info.max_number++;

            execute = {
                $set: {
                    [diffi + ".max_number"]: diffi_info.max_number
                }
            }
        }

        return {
            qns_number: qns_number,
            execute: execute
        };
    },

    async downloadAndUploadPic(pic_url: string, diffi: string, qns_number: number) {
        const get = require('async-get-file');

        const options = {
            directory: "./cache/qns_pic_dl/",
            filename: `${qns_number}.png`
        };
        await get(pic_url, options);

        await core.sleep(0.5);

        const upload_status = await db.storjUpload({
            bucket_name: 'bounty-questions-db',
            local_file_name: `./cache/qns_pic_dl/${qns_number}.png`,
            db_file_name: `${diffi}/${qns_number}.png`
        });
        unlink(`./cache/qns_pic_dl/${qns_number}.png`, () => { return; });

        return upload_status;
    },

    async createManipulationLog(interaction: CommandInteraction, finish_time: number, difficulty: string, qns_number: number) {
        const logs_operator = new core.BaseMongoOperator({
            db: 'Bounty',
            coll: 'AdminLogs'
        });

        const mani_info = {
            type: 'create-qns',
            accessor: interaction.user.id,
            finish_time: finish_time,
            qns_info: {
                difficulty: difficulty,
                number: qns_number
            }
        };

        const create_result = await (await logs_operator.cursor).insertOne(mani_info);
        return create_result.acknowledged;
    }
}

const EBQMC_functions = {
    async getInputData(interaction) {
        return {
            diffi: interaction.options.getString('difficulty'),
            qns_number: interaction.options.getInteger('number'),
            new_max_choices: interaction.options.getInteger('new-max-choices')
        }
    }
}

const EBQA_functions = {
    async getInputData(interaction) {
        const new_answers: string[] = interaction.options.getString('new-answers').split(";");

        // a -> A; b -> B; ...
        for (let i = 0; i < new_answers.length; i++) {
            new_answers[i] = new_answers[i].toUpperCase();
        }

        return {
            diffi: interaction.options.getString('difficulty'),
            qns_number: interaction.options.getInteger('number'),
            new_answers: new_answers
        }
    }
}

const LCBQA_functions = {
    async getLogs(user_id: string) {
        const logs_operator = new core.BaseMongoOperator({
            db: 'Bounty',
            coll: 'AdminLogs'
        });

        const logs = (await logs_operator.cursor).find({ accessor: user_id }).sort({ finish_time: 1 });
        return logs;
    }
}

const DCBQA_functions = {
    async getInputData(interaction) {
        return {
            diffi: interaction.options.getString('difficulty'),
            qns_number: interaction.options.getInteger('number')
        }
    },

    async getLog(user_id: string, diffi: string, qns_number: number, cursor) {
        const log = await (await cursor).findOne({
            accessor: user_id,
            "qns_info.difficulty": diffi,
            "qns_info.number": qns_number
        });

        if (!log) return {
            status: db.StatusCode.DATA_NOT_FOUND
        };

        return {
            status: db.StatusCode.DATA_FOUND,
            log: log
        };
    }
}
