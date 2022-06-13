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
const qns_db_1 = require("./slcmd/qns_db");
const shortcut_1 = require("../../shortcut");
const mongodb_1 = require("mongodb");
const fs_1 = require("fs");
class BountyQnsDBManager extends shortcut_1.core.BaseManager {
    constructor(f_platform) {
        super(f_platform);
        this.qns_op = new shortcut_1.core.BountyQnsDBOperator();
        this.SLCMD_REGISTER_LIST = qns_db_1.REGISTER_LIST;
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
                    yield CBQ_functions.checkAndAutoCreateCache(interaction, diffi, db_cache_operator.cursor_promise);
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
                    const pic = collected.first().attachments.first();
                    if (!pic)
                        return yield interaction.followUp('此並非圖片格式，請重新執行指令');
                    const pic_url = pic.url;
                    const upload_status = yield CBQ_functions.downloadAndUploadPic(pic_url, diffi, qns_and_update_data.qns_number);
                    if (upload_status)
                        yield interaction.followUp('圖片已上傳！');
                    else
                        return yield interaction.followUp('圖片上傳錯誤');
                    // create qns info in mdb
                    const create_params = {
                        difficulty: diffi,
                        qns_number: qns_and_update_data.qns_number,
                        max_choices: max_choices,
                        correct_ans: correct_ans
                    };
                    const create_result = yield this.qns_op.createDefaultData(create_params);
                    if (create_result.status === shortcut_1.db.StatusCode.WRITE_DATA_ERROR)
                        return yield interaction.followUp('error creating qns info');
                    else {
                        yield interaction.followUp('問題資料已建立！');
                        yield interaction.channel.send(JSON.stringify(create_params, null, "\t"));
                    }
                    const mani_log_create_result = yield CBQ_functions.createManipulationLog(interaction, Date.now(), diffi, qns_and_update_data.qns_number);
                    if (!mani_log_create_result)
                        return yield interaction.followUp('error creating mani logs');
                    // update storj cache
                    const update_result = yield (yield db_cache_operator.cursor_promise).updateOne({ type: 'cache' }, qns_and_update_data.execute);
                    if (!update_result.acknowledged)
                        return yield interaction.followUp('error updating cache');
                    else
                        return;
                }
                case 'edit-bounty-qns-max-choices': {
                    yield interaction.deferReply();
                    // get input data
                    const inner_values = yield EBQMC_functions.getInputData(interaction);
                    const diffi = inner_values.diffi;
                    const qns_number = inner_values.qns_number;
                    const new_max_choices = inner_values.new_max_choices;
                    const update_result = yield this.qns_op.setMaxChoices(diffi, qns_number, new_max_choices);
                    if (update_result.status === shortcut_1.db.StatusCode.DATA_NOT_FOUND)
                        return yield interaction.editReply('目標問題不存在！');
                    if (update_result.status === shortcut_1.db.StatusCode.WRITE_DATA_ERROR)
                        return yield interaction.editReply('更改錯誤！');
                    else
                        return yield interaction.editReply('更改完成！');
                }
                case 'edit-bounty-qns-answers': {
                    yield interaction.deferReply();
                    // get input data
                    const inner_values = yield EBQA_functions.getInputData(interaction);
                    const diffi = inner_values.diffi;
                    const qns_number = inner_values.qns_number;
                    const new_answers = inner_values.new_answers;
                    const update_result = yield this.qns_op.setCorrectAns(diffi, qns_number, new_answers);
                    if (update_result.status === shortcut_1.db.StatusCode.DATA_NOT_FOUND)
                        return yield interaction.editReply('目標問題不存在！');
                    if (update_result.status === shortcut_1.db.StatusCode.WRITE_DATA_ERROR)
                        return yield interaction.editReply('更改錯誤！');
                    else
                        return yield interaction.editReply('更改完成！');
                }
                case 'log-create-bounty-qns-actions': {
                    yield interaction.deferReply();
                    const logs = yield (yield LCBQA_functions.getLogs(interaction.user.id)).toArray();
                    if (logs.length === 0)
                        return yield interaction.editReply('沒有任何紀錄！');
                    const logs_prettify = [];
                    for (let i = 0; i < logs.length; i++) {
                        const log = logs[i];
                        const finish_time_prettify = (new Date(log.finish_time)).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });
                        logs_prettify.push(`時間：${finish_time_prettify}\n題目難度：${log.qns_info.difficulty}\n題目編號：${log.qns_info.number}`);
                    }
                    while (logs_prettify.length > 0) {
                        yield interaction.channel.send(logs_prettify[0]);
                        logs_prettify.shift();
                        yield LCBQA_functions.sleep(0.5);
                    }
                    return yield interaction.editReply('輸出完畢！');
                }
                case 'del-create-bounty-qns-action': {
                    yield interaction.deferReply();
                    const inner_values = yield DCBQA_functions.getInputData(interaction);
                    const diffi = inner_values.diffi;
                    const qns_number = inner_values.qns_number;
                    const logs_operator = new shortcut_1.core.BaseOperator({
                        db: 'Bounty',
                        coll: 'AdminLogs'
                    });
                    const search_result = yield DCBQA_functions.getLog(interaction.user.id, diffi, qns_number, logs_operator.cursor_promise);
                    if (search_result.status === shortcut_1.db.StatusCode.DATA_NOT_FOUND) {
                        return yield interaction.editReply('找不到此操作；或是此操作不來自你');
                    }
                    else {
                        yield interaction.editReply('已找到資料，進行刪除中...');
                    }
                    const delete_result = yield shortcut_1.db.storjDeleteFile({
                        bucket_name: 'bounty-questions-db',
                        delete_path: `${diffi}/${qns_number}.png`
                    });
                    if (!delete_result)
                        return yield interaction.editReply('刪除題目圖片出錯');
                    const del_qns_info_result = yield (yield this.qns_op.cursor_promise).deleteOne({
                        difficulty: diffi,
                        number: qns_number
                    });
                    if (!del_qns_info_result.acknowledged)
                        return yield interaction.editReply('刪除題目資訊出錯');
                    const del_log_result = yield (yield logs_operator.cursor_promise).deleteOne({
                        accessor: interaction.user.id,
                        "qns_info.difficulty": diffi,
                        "qns_info.number": qns_number
                    });
                    if (!del_log_result.acknowledged)
                        return yield interaction.editReply('刪除操作紀錄出錯');
                    else
                        yield interaction.followUp('刪除成功！');
                }
            }
        });
    }
}
exports.BountyQnsDBManager = BountyQnsDBManager;
const CBQ_functions = {
    getInputData(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const correct_ans = interaction.options.getString('correct-ans').split(";");
            // a -> A; b -> B; ...
            for (let i = 0; i < correct_ans.length; i++) {
                correct_ans[i] = correct_ans[i].toUpperCase();
            }
            return {
                diffi: interaction.options.getString('difficulty'),
                max_choices: interaction.options.getInteger('max-choices'),
                correct_ans: correct_ans
            };
        });
    },
    checkAndAutoCreateCache(interaction, diffi, cursor_promise) {
        return __awaiter(this, void 0, void 0, function* () {
            const exist_cache = yield (yield cursor_promise).findOne({ type: 'cache' });
            if (!exist_cache) {
                const create_cache = yield CBQ_functions.createQnsInfoCache(['easy', 'medium', 'hard']);
                const create_result = yield (yield cursor_promise).insertOne(create_cache);
                if (!create_result.acknowledged)
                    return yield interaction.editReply('error creating cache');
            }
            else {
                const create_cache = yield CBQ_functions.createQnsInfoCache([diffi]);
                const execute = {
                    $set: {
                        [diffi]: create_cache[diffi]
                    }
                };
                const update_result = yield (yield cursor_promise).updateOne({ type: 'cache' }, execute);
                if (!update_result.acknowledged)
                    return yield interaction.editReply('error updating cache');
            }
        });
    },
    createQnsInfoCache(diffi_list) {
        return __awaiter(this, void 0, void 0, function* () {
            const new_cache = {
                _id: new mongodb_1.ObjectId(),
                type: 'cache',
                easy: undefined,
                medium: undefined,
                hard: undefined
            };
            yield shortcut_1.core.asyncForEach(diffi_list, (diffi) => __awaiter(this, void 0, void 0, function* () {
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
            }));
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
                    number: qns_number
                }
            };
            const create_result = yield (yield logs_operator.cursor_promise).insertOne(mani_info);
            return create_result.acknowledged;
        });
    }
};
const EBQMC_functions = {
    getInputData(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                diffi: interaction.options.getString('difficulty'),
                qns_number: interaction.options.getInteger('number'),
                new_max_choices: interaction.options.getInteger('new-max-choices')
            };
        });
    }
};
const EBQA_functions = {
    getInputData(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const new_answers = interaction.options.getString('new-answers').split(";");
            // a -> A; b -> B; ...
            for (let i = 0; i < new_answers.length; i++) {
                new_answers[i] = new_answers[i].toUpperCase();
            }
            return {
                diffi: interaction.options.getString('difficulty'),
                qns_number: interaction.options.getInteger('number'),
                new_answers: new_answers
            };
        });
    }
};
const LCBQA_functions = {
    getLogs(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const logs_operator = new shortcut_1.core.BaseOperator({
                db: 'Bounty',
                coll: 'AdminLogs'
            });
            const logs = (yield logs_operator.cursor_promise).find({ accessor: user_id }).sort({ finish_time: 1 });
            return logs;
        });
    },
    sleep(sec) {
        return new Promise(resolve => setTimeout(resolve, sec * 1000));
    }
};
const DCBQA_functions = {
    getInputData(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                diffi: interaction.options.getString('difficulty'),
                qns_number: interaction.options.getInteger('number')
            };
        });
    },
    getLog(user_id, diffi, qns_number, cursor_promise) {
        return __awaiter(this, void 0, void 0, function* () {
            const log = yield (yield cursor_promise).findOne({
                accessor: user_id,
                "qns_info.difficulty": diffi,
                "qns_info.number": qns_number
            });
            if (!log)
                return {
                    status: shortcut_1.db.StatusCode.DATA_NOT_FOUND
                };
            return {
                status: shortcut_1.db.StatusCode.DATA_FOUND,
                log: log
            };
        });
    }
};
