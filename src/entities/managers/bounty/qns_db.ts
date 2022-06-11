import { CommandInteraction, ApplicationCommandData } from 'discord.js';
import { REGISTER_LIST } from './slcmd/qns_db';
import { core, db } from '../../shortcut';
import { ObjectId } from 'mongodb';
import { unlink } from 'fs';


class BountyQnsDBManager extends core.BaseManager {
    private qns_op: core.BountyQnsDBOperator;
    public f_platform: core.BasePlatform;
    public SLCMD_REGISTER_LIST: Array<ApplicationCommandData>;

    constructor(f_platform: core.BasePlatform) {
        super(f_platform);
        this.qns_op = new core.BountyQnsDBOperator();

        //this.SLCMD_REGISTER_LIST = REGISTER_LIST;

        this.setupListener();
    }

    private setupListener() {
        this.f_platform.f_bot.on('interactionCreate', async (interaction) => {
            if (!(this.checkPerm(interaction, 'ADMINISTRATOR'))) return;
            if (interaction.isCommand()) await this.slcmdHandler(interaction);
        });
    }

    private async slcmdHandler(interaction: CommandInteraction) {

        switch (interaction.commandName) {
            case 'create-bounty-qns': {
                await interaction.deferReply({ ephemeral: true });

                // get input data
                const diffi = interaction.options.getString('difficulty');
                const max_choices = interaction.options.getInteger('max-choices');
                const correct_ans: Array<string> = interaction.options.getString('correct-ans').split(";");
                
                // create operator
                const db_cache_operator = new core.BaseOperator({
                    db: 'Bounty',
                    coll: 'StorjQnsDBCache'
                });

                // check cache
                // if not exist -> create cache
                const exist_cache = await (await db_cache_operator.cursor_promise).findOne({ type: 'cache' });

                if (!exist_cache) {
                    const create_cache = await this.createQnsInfoCache();

                    const create_result = await (await db_cache_operator.cursor_promise).insertOne(create_cache);
                    if (!create_result.acknowledged) return await interaction.editReply('error creating cache');
                } else {
                    // console.log('cache found');

                    // const fixed_cache = await this.createQnsInfoCache();
                    // console.log('fixed cache', fixed_cache);

                    // const execute = {
                    //     $set: {
                    //         easy: fixed_cache.easy,
                    //         medium: fixed_cache.medium,
                    //         hard: fixed_cache.hard
                    //     }
                    // }

                    // const result = await (await db_cache_operator.cursor_promise).updateOne({ type: 'cache' }, execute);
                    // if (!result.acknowledged) return await interaction.editReply('error fixing cache');
                    // else console.log('success fixing cache');
                }
                
                // refresh cache
                const refresh_cache = await (await db_cache_operator.cursor_promise).findOne({ type: 'cache' });

                // update current diffi cache
                const qns_and_update_data = await this.getQnsNumber(refresh_cache, diffi);

                const update_result: any = await (await db_cache_operator.cursor_promise).updateOne({ type: 'cache' }, qns_and_update_data.execute);
                if (!update_result.acknowledged) return await interaction.editReply('error updating cache');
                //

                //
                const create_result = await this.qns_op.createDefaultData({
                    difficulty: diffi,
                    qns_number: qns_and_update_data.qns_number,
                    max_choices: max_choices,
                    correct_ans: correct_ans
                });
                if (create_result.status === 'M002') return await interaction.editReply('error creating qns info');
                //

                let collected;
                try {
                    await interaction.editReply('請上傳問題圖片（限時30秒）');
                    const filter = m => m.author.id === interaction.user.id;

                    collected = await interaction.channel.awaitMessages({
                        filter: filter,
                        max: 1,
                        time: 30000,
                        errors: ['time']
                    });
                } catch {
                    return await interaction.editReply('上傳圖片過時');
                }


                const pic_url = collected.first().attachments.first().url;

                const get = require('async-get-file');

                const options = {
                    directory: "./cache/qns_pic_dl/",
                    filename: `${qns_and_update_data.qns_number}.png`
                };

                await get(pic_url, options);
                
                const upload_status = await db.storjUpload({
                    bucket_name: 'bounty-questions-db',
                    local_file_name: `./cache/qns_pic_dl/${qns_and_update_data.qns_number}.png`,
                    db_file_name: `${diffi}/${qns_and_update_data.qns_number}.png`
                });
                if (upload_status) await interaction.followUp('圖片已上傳！');
                unlink(`./cache/qns_pic_dl/${qns_and_update_data.qns_number}.png`, () => { return; });
            }
        }
    }

    private async createQnsInfoCache() {
        const new_cache = {
            _id: new ObjectId(),
            type: 'cache',
            easy: undefined,
            medium: undefined,
            hard: undefined
        };

        const diffi_list = ['easy', 'medium', 'hard'];

        for (let i = 0; i < diffi_list.length; i++) {
            const diffi = diffi_list[i];

            const file_names = await db.storjGetFolderFiles({
                bucket_name: 'bounty-questions-db',
                prefix: `${diffi}/`,
                suffixes: '.png'
            });

            console.log('file names', file_names);

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
        }

        return new_cache;
    }

    private async checkMissingNumber(arr: Array<number>) {
        let curr_num = 0;
        let ind = 0;
        const missing = [];
        while (ind < arr.length) {
            if (arr[ind] !== curr_num) missing.push(curr_num);
            else ind++;

            curr_num++;
        }
        return missing;
    }

    private async getQnsNumber(cache: object, diffi: string) {
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
    }
}

export {
    BountyQnsDBManager
};
