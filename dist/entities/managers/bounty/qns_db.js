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
                    // input-data-pre-process
                    const diffi = interaction.options.getString('difficulty');
                    const max_choices = interaction.options.getInteger('max-choices');
                    const correct_ans = interaction.options.getString('correct-ans').split(";");
                    //
                    const db_cache_operator = new shortcut_1.core.BaseOperator({
                        db: 'Bounty',
                        coll: 'StorjQnsDBCache'
                    });
                    let cache = yield (yield db_cache_operator.cursor_promise).findOne({ type: 'cache' });
                    if (cache.length === 0) {
                        console.log('cache not found');
                        const new_cache = yield this.createQnsInfoCache();
                        const result = yield (yield db_cache_operator.cursor_promise).insertOne(new_cache);
                        if (!result.acknowledged)
                            return yield interaction.editReply('error setting cache');
                    }
                    else {
                        const fixed_cache = yield this.createQnsInfoCache();
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
                    }
                    // refresh cache
                    cache = yield (yield db_cache_operator.cursor_promise).findOne({ type: 'cache' });
                    //
                    console.log('cache', cache);
                    console.log(cache[diffi]);
                    const qns_and_update_data = yield this.getQnsNumber(cache, diffi);
                    let result = yield (yield db_cache_operator.cursor_promise).updateOne({ type: 'cache' }, qns_and_update_data.execute);
                    if (!result.acknowledged)
                        return yield interaction.editReply('error updating cache');
                    //
                    //
                    result = yield this.qns_op.createDefaultData({
                        difficulty: diffi,
                        qns_number: qns_and_update_data.qns_number,
                        max_choices: max_choices,
                        correct_ans: correct_ans
                    });
                    if (result.status === 'M002')
                        return yield interaction.editReply('error creating qns info');
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
                    const download = require('download-file');
                    const options = {
                        directory: "./cache/qns_pic_dl/",
                        filename: `${qns_and_update_data.qns_number}.png`
                    };
                    const download_pic = new Promise((resolve) => {
                        download(pic_url, options);
                        resolve('ok!');
                    });
                    yield download_pic;
                    const upload_status = yield shortcut_1.db.storjUpload({
                        bucket_name: 'bounty-questions-db',
                        local_file_name: `./cache/qns_pic_dl/${qns_and_update_data.qns_number}.png`,
                        db_file_name: `${diffi}/${qns_and_update_data.qns_number}.png`
                    });
                    if (upload_status)
                        yield interaction.followUp('圖片已上傳！');
                    (0, fs_1.unlink)(`./cache/qns_pic_dl/temp.png`, () => { return; });
                }
            }
        });
    }
    createQnsInfoCache() {
        return __awaiter(this, void 0, void 0, function* () {
            const new_cache = {
                _id: new mongodb_1.ObjectId(),
                type: 'cache',
                easy: null,
                medium: null,
                hard: null
            };
            ['easy', 'medium', 'hard'].forEach((diffi) => __awaiter(this, void 0, void 0, function* () {
                const file_names = yield shortcut_1.db.storjGetFolderFiles({
                    bucket_name: 'bounty-questions-db',
                    prefix: `${diffi}/`,
                    suffixes: '.png'
                });
                let max_number = null;
                let skipped_numbers = null;
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
            }));
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
