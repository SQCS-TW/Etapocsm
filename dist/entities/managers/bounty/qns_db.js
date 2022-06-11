"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BountyQnsDBManager = void 0;
const shortcut_1 = require("../../shortcut");
const mongodb_1 = require("mongodb");
const fs_1 = require("fs");
class BountyQnsDBManager extends shortcut_1.core.BaseManager {
    constructor(f_platform) {
        super(f_platform);
        this.qns_op = new shortcut_1.core.BountyQnsDBOperator();
        //this.SLCMD_REGISTER_LIST = REGISTER_LIST;
        this.setupListener();
    }
    setupListener() {
        this.f_platform.f_bot.on('interactionCreate', (interaction) => __awaiter(this, void 0, void 0, function* () {
            if (!(this.checkPerm(interaction, 'ADMINISTRATOR')))
                return;
            if (interaction.isCommand())
                yield this.slcmdHandler(interaction);
        }));
    }
    slcmdHandler(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (interaction.commandName) {
                case 'create-bounty-qns': {
                    yield interaction.deferReply({ ephemeral: true });
                    // get input data
                    const diffi = interaction.options.getString('difficulty');
                    const max_choices = interaction.options.getInteger('max-choices');
                    const correct_ans = interaction.options.getString('correct-ans').split(";");
                    // create operator
                    const db_cache_operator = new shortcut_1.core.BaseOperator({
                        db: 'Bounty',
                        coll: 'StorjQnsDBCache'
                    });
                    // check cache
                    // if not exist -> create cache
                    // else -> fix cache (?)
                    const exist_cache = yield (yield db_cache_operator.cursor_promise).findOne({ type: 'cache' });
                    console.log('exist cache', exist_cache);
                    if (!exist_cache) {
                        console.log('cache not found');
                        const create_cache = yield this.createQnsInfoCache();
                        console.log('create cache', create_cache);
                        const create_result = yield (yield db_cache_operator.cursor_promise).insertOne(create_cache);
                        if (!create_result.acknowledged)
                            return yield interaction.editReply('error creating cache');
                        else
                            console.log('success creating cache');
                    }
                    else {
                        console.log('cache found');
                        const fixed_cache = yield this.createQnsInfoCache();
                        console.log('fixed cache', fixed_cache);
                        const execute = {
                            $set: {
                                easy: fixed_cache.easy,
                                medium: fixed_cache.medium,
                                hard: fixed_cache.hard
                            }
                        };
                        const result = yield (yield db_cache_operator.cursor_promise).updateOne({ type: 'cache' }, execute);
                        if (!result.acknowledged)
                            return yield interaction.editReply('error fixing cache');
                        else
                            console.log('success fixing cache');
                    }
                    // refresh cache
                    const refresh_cache = yield (yield db_cache_operator.cursor_promise).findOne({ type: 'cache' });
                    // update current diffi cache
                    console.log('refresh_cache', refresh_cache);
                    console.log('diffi', diffi);
                    const qns_and_update_data = yield this.getQnsNumber(refresh_cache, diffi);
                    console.log('qns_and_update_data', qns_and_update_data);
                    const update_result = yield (yield db_cache_operator.cursor_promise).updateOne({ type: 'cache' }, qns_and_update_data.execute);
                    if (!update_result.acknowledged)
                        return yield interaction.editReply('error updating cache');
                    else
                        console.log('success updating cache');
                    //
                    //
                    const create_result = yield this.qns_op.createDefaultData({
                        difficulty: diffi,
                        qns_number: qns_and_update_data.qns_number,
                        max_choices: max_choices,
                        correct_ans: correct_ans
                    });
                    if (create_result.status === 'M002')
                        return yield interaction.editReply('error creating qns info');
                    else
                        console.log('success creating qns info');
                    //
                    let collected;
                    try {
                        yield interaction.editReply('請上傳問題圖片（限時30秒）');
                        const filter = m => m.author.id === interaction.user.id;
                        collected = yield interaction.channel.awaitMessages({
                            filter: filter,
                            max: 1,
                            time: 30000,
                            errors: ['time']
                        });
                    }
                    catch (_a) {
                        return yield interaction.editReply('上傳圖片過時');
                    }
                    const pic_url = collected.first().attachments.first().url;
                    const get = require('async-get-file');
                    const options = {
                        directory: "./cache/qns_pic_dl/",
                        filename: `${qns_and_update_data.qns_number}.png`
                    };
                    yield get(pic_url, options);
                    const upload_status = yield shortcut_1.db.storjUpload({
                        bucket_name: 'bounty-questions-db',
                        local_file_name: `./cache/qns_pic_dl/${qns_and_update_data.qns_number}.png`,
                        db_file_name: `${diffi}/${qns_and_update_data.qns_number}.png`
                    });
                    if (upload_status)
                        yield interaction.followUp('圖片已上傳！');
                    (0, fs_1.unlink)(`./cache/qns_pic_dl/${qns_and_update_data.qns_number}.png`, () => { return; });
                }
            }
        });
    }
    createQnsInfoCache() {
        return __awaiter(this, void 0, void 0, function* () {
            const new_cache = {
                _id: new mongodb_1.ObjectId(),
                type: 'cache',
                easy: undefined,
                medium: undefined,
                hard: undefined
            };
            const diffi_list = ['easy', 'medium', 'hard'];
            for (let i = 0; i < diffi_list.length; i++) {
                const diffi = diffi_list[i];
                const file_names = yield shortcut_1.db.storjGetFolderFiles({
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
                }
                else {
                    for (let i = 0; i < file_names.length; i++) {
                        file_names[i] = Number(file_names[i].replace(".png", '')); // 0.png -> 0; 1.png -> 1
                    }
                    max_number = Math.max(...file_names);
                    file_names.sort((a, b) => a - b);
                    skipped_numbers = yield this.checkMissingNumber(file_names);
                }
                new_cache[diffi] = {
                    max_number: max_number,
                    skipped_numbers: skipped_numbers
                };
                console.log('new cache', new_cache);
            }
            return new_cache;
        });
    }
    checkMissingNumber(arr) {
        return __awaiter(this, void 0, void 0, function* () {
            let curr_num = 0;
            let ind = 0;
            const missing = [];
            while (ind < arr.length) {
                if (arr[ind] !== curr_num)
                    missing.push(curr_num);
                else
                    ind++;
                curr_num++;
            }
            return missing;
        });
    }
    getQnsNumber(cache, diffi) {
        return __awaiter(this, void 0, void 0, function* () {
            let qns_number;
            let execute;
            const diffi_info = cache[diffi];
            if (diffi_info.skipped_numbers.length !== 0) {
                qns_number = diffi_info.skipped_numbers[0];
                diffi_info.skipped_numbers.shift();
                execute = {
                    $set: {
                        [diffi + ".skipped_numbers"]: diffi_info.skipped_numbers
                    }
                };
            }
            else {
                qns_number = diffi_info.max_number + 1;
                diffi_info.max_number++;
                execute = {
                    $set: {
                        [diffi + ".max_number"]: diffi_info.max_number
                    }
                };
            }
            return {
                qns_number: qns_number,
                execute: execute
            };
        });
    }
}
exports.BountyQnsDBManager = BountyQnsDBManager;