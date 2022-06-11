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
                    yield interaction.deferReply();
                    // get input data
                    const inner_values = yield CBQ_functions.getInputData(interaction);
                    const diffi = inner_values.diffi;
                    const max_choices = inner_values.max_choices;
                    const correct_ans = inner_values.correct_ans;
                    // create operator
                    const db_cache_operator = new shortcut_1.core.BaseOperator({
                        db: 'Bounty',
                        coll: 'StorjQnsDBCache'
                    });
                    // check cache
                    // if not exist -> create cache
                    yield CBQ_functions.checkAndAutoCreateCache(interaction, db_cache_operator.cursor_promise);
                    // refresh cache
                    const refresh_cache = yield (yield db_cache_operator.cursor_promise).findOne({ type: 'cache' });
                    // update current diffi cache --> update when finished upload pic
                    const qns_and_update_data = yield CBQ_functions.getQnsNumber(refresh_cache, diffi);
                    // get the picture that will be uploaded to storj
                    let collected;
                    try {
                        yield interaction.editReply('請上傳問題圖片（限時60秒）');
                        const filter = m => m.author.id === interaction.user.id;
                        collected = yield interaction.channel.awaitMessages({
                            filter: filter,
                            max: 1,
                            time: 60000,
                            errors: ['time']
                        });
                    }
                    catch (_a) {
                        return yield interaction.editReply('上傳圖片過時');
                    }
                    const pic_url = collected.first().attachments.first().url;
                    const upload_status = yield CBQ_functions.downloadAndUploadPic(pic_url, diffi, qns_and_update_data.qns_number);
                    if (upload_status)
                        yield interaction.followUp('圖片已上傳！');
                    else
                        return yield interaction.followUp('圖片上傳錯誤');
                    // create qns info in mdb
                    const create_result = yield this.qns_op.createDefaultData({
                        difficulty: diffi,
                        qns_number: qns_and_update_data.qns_number,
                        max_choices: max_choices,
                        correct_ans: correct_ans
                    });
                    if (create_result.status === shortcut_1.db.StatusCode.WRITE_DATA_ERROR)
                        return yield interaction.followUp('error creating qns info');
                    else
                        yield interaction.followUp('問題資料已建立！');
                    const mani_log_create_result = yield CBQ_functions.createManipulationLog(interaction, Date.now(), diffi, qns_and_update_data.qns_number);
                    if (!mani_log_create_result)
                        return yield interaction.followUp('error creating mani logs');
                    // update storj cache
                    const update_result = yield (yield db_cache_operator.cursor_promise).updateOne({ type: 'cache' }, qns_and_update_data.execute);
                    if (!update_result.acknowledged)
                        return yield interaction.followUp('error updating cache');
                }
            }
        });
    }
}
exports.BountyQnsDBManager = BountyQnsDBManager;
const CBQ_functions = {
    getInputData(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                diffi: interaction.options.getString('difficulty'),
                max_choices: interaction.options.getInteger('max-choices'),
                correct_ans: interaction.options.getString('correct-ans').split(";")
            };
        });
    },
    checkAndAutoCreateCache(interaction, cursor_promise) {
        return __awaiter(this, void 0, void 0, function* () {
            const exist_cache = yield (yield cursor_promise).findOne({ type: 'cache' });
            if (!exist_cache) {
                const create_cache = yield CBQ_functions.createQnsInfoCache();
                const create_result = yield (yield cursor_promise).insertOne(create_cache);
                if (!create_result.acknowledged)
                    return yield interaction.editReply('error creating cache');
            }
        });
    },
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
            }
            return new_cache;
        });
    },
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
    },
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
    },
    downloadAndUploadPic(pic_url, diffi, qns_number) {
        return __awaiter(this, void 0, void 0, function* () {
            const get = require('async-get-file');
            const options = {
                directory: "./cache/qns_pic_dl/",
                filename: `${qns_number}.png`
            };
            yield get(pic_url, options);
            const upload_status = yield shortcut_1.db.storjUpload({
                bucket_name: 'bounty-questions-db',
                local_file_name: `./cache/qns_pic_dl/${qns_number}.png`,
                db_file_name: `${diffi}/${qns_number}.png`
            });
            (0, fs_1.unlink)(`./cache/qns_pic_dl/${qns_number}.png`, () => { return; });
            return upload_status;
        });
    },
    createManipulationLog(interaction, finish_time, difficulty, qns_number) {
        return __awaiter(this, void 0, void 0, function* () {
            const logs_operator = new shortcut_1.core.BaseOperator({
                db: 'Bounty',
                coll: 'AdminLogs'
            });
            const mani_info = {
                _id: new mongodb_1.ObjectId(),
                type: 'create-qns',
                accessor: interaction.user.id,
                finish_time: finish_time,
                qns_info: {
                    difficulty: difficulty,
                    qns_number: qns_number
                }
            };
            const create_result = yield (yield logs_operator.cursor_promise).insertOne(mani_info);
            return create_result.acknowledged;
        });
    }
};
