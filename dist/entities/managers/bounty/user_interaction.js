"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.EndBountySessionManager = exports.BountyEventManager = exports.BountyAccountManager = void 0;
const discord_js_1 = require("discord.js");
const shortcut_1 = require("../../shortcut");
const fs_1 = require("fs");
const mongodb_1 = require("mongodb");
const user_interaction_1 = require("./components/user_interaction");
const session = __importStar(require("../../powerup_mngs/session_mng"));
class BountyAccountManager extends shortcut_1.core.BaseManager {
    constructor(f_platform) {
        super(f_platform);
        this.account_op = new shortcut_1.core.BountyUserAccountOperator();
        this.ongoing_op = new shortcut_1.core.BountyUserOngoingInfoOperator();
        this.mainlvl_acc_op = new shortcut_1.core.MainLevelAccountOperator();
        this.setupListener();
        this.SLCMD_REGISTER_LIST = user_interaction_1.ACCOUNT_MANAGER_SLCMD;
    }
    setupListener() {
        this.f_platform.f_bot.on('interactionCreate', (interaction) => __awaiter(this, void 0, void 0, function* () {
            if (interaction.isCommand())
                yield this.slcmdHandler(interaction);
        }));
    }
    slcmdHandler(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (interaction.commandName) {
                case 'create-main-bounty-account': {
                    yield interaction.deferReply({ ephemeral: true });
                    const exist_result = yield this.account_op.checkDataExistence({ user_id: interaction.user.id });
                    if (exist_result.status === shortcut_1.db.StatusCode.DATA_FOUND)
                        return yield interaction.editReply('你已經建立過懸賞區主帳號了！');
                    const create_result = yield this.account_op.createDefaultData({ user_id: interaction.user.id });
                    if (create_result.status === shortcut_1.db.StatusCode.WRITE_DATA_ERROR)
                        return yield interaction.editReply('建立帳號時發生錯誤了！');
                    else {
                        yield this.mainlvl_acc_op.createUserMainAccount(interaction.user.id);
                        return yield interaction.editReply('帳號建立成功！');
                    }
                }
                case 'check-main-bounty-account': {
                    yield interaction.deferReply({ ephemeral: true });
                    const exist_result = yield this.account_op.checkDataExistence({ user_id: interaction.user.id });
                    if (exist_result.status === shortcut_1.db.StatusCode.DATA_NOT_FOUND)
                        return yield interaction.editReply('你還沒建立過懸賞區主帳號！');
                    const user_account = yield (yield this.account_op.cursor_promise).findOne({ user_id: interaction.user.id });
                    return yield interaction.editReply(JSON.stringify(user_account, null, "\t"));
                }
                case 'check-bounty-ongoing-info': {
                    yield interaction.deferReply({ ephemeral: true });
                    const exist_result = yield this.ongoing_op.checkDataExistence({ user_id: interaction.user.id });
                    if (exist_result.status === shortcut_1.db.StatusCode.DATA_NOT_FOUND)
                        return yield interaction.editReply('你還沒開啟過懸賞區！');
                    const user_ongoing_info = yield (yield this.ongoing_op.cursor_promise).findOne({ user_id: interaction.user.id });
                    return yield interaction.editReply(JSON.stringify(user_ongoing_info, null, "\t"));
                }
            }
        });
    }
}
exports.BountyAccountManager = BountyAccountManager;
class QnsThreadBeautifier {
    constructor() {
        this.len_to_emoji = {
            2: '🔒 ║ ❓',
            3: '🔒 ║ ❓ × 2️⃣'
        };
        this.diffi_to_emoji = {
            'easy': '🟩',
            'medium': '🟧',
            'hard': '🟥'
        };
        this.ban_repeat = 4;
        this.ban_line = '═';
        this.ban_left = '╣';
        this.ban_right = '╠';
    }
    beautify(thread) {
        return __awaiter(this, void 0, void 0, function* () {
            const text = [];
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
                    if (thread_len > 1)
                        text.push(this.len_to_emoji[thread_len]);
                }
                else if (thread_len > 0 || !previous_comp) {
                    text.push('🔒');
                }
                else {
                    text.push('✅');
                    previous_comp = true;
                }
                if (diffi !== 'hard')
                    text.push('\n');
            }
            return text.join('\n');
        });
    }
}
const qns_thread_beauty = new QnsThreadBeautifier();
class BountyEventManager extends shortcut_1.core.BaseManager {
    constructor(f_platform) {
        super(f_platform);
        this.account_op = new shortcut_1.core.BountyUserAccountOperator();
        this.ongoing_op = new shortcut_1.core.BountyUserOngoingInfoOperator();
        this.qns_op = new shortcut_1.core.BountyQnsDBOperator();
        this.start_button_op = new shortcut_1.core.BaseOperator({
            db: 'Bounty',
            coll: 'StartButtonPipeline'
        });
        this.end_button_op = new shortcut_1.core.BaseOperator({
            db: 'Bounty',
            coll: 'EndButtonPipeline'
        });
        this.dropdown_op = new shortcut_1.core.BaseOperator({
            db: 'Bounty',
            coll: 'DropdownPipeline'
        });
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
        this.alphabet_sequence = [
            'A', 'B', 'C', 'D', 'E',
            'F', 'G', 'H', 'I', 'J',
            'K', 'L', 'M', 'N', 'O',
            'P', 'Q', 'R', 'S', 'T',
            'U', 'V', 'W', 'X', 'Y', 'Z'
        ];
        this.setupListener();
        this.SLCMD_REGISTER_LIST = user_interaction_1.EVENT_MANAGER_SLCMD;
    }
    setupListener() {
        this.f_platform.f_bot.on('interactionCreate', (interaction) => __awaiter(this, void 0, void 0, function* () {
            if (interaction.isCommand())
                yield this.slcmdHandler(interaction);
            else if (interaction.isButton())
                yield this.buttonHandler(interaction);
            else if (interaction.isSelectMenu())
                yield this.dropdownHandler(interaction);
        }));
    }
    slcmdHandler(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (interaction.commandName) {
                case 'start-bounty': {
                    yield interaction.deferReply({ ephemeral: true });
                    const check_main_acc = yield this.account_op.checkDataExistence({ user_id: interaction.user.id });
                    if (check_main_acc.status === shortcut_1.db.StatusCode.DATA_NOT_FOUND)
                        return yield interaction.editReply('請先建立你的懸賞區資料！');
                    const user_acc = yield (yield this.account_op.cursor_promise).findOne({ user_id: interaction.user.id });
                    if (!user_acc.auth)
                        return yield interaction.editReply('你沒有遊玩懸賞區的權限！');
                    if (user_acc.status)
                        return yield interaction.editReply('你已經在遊玩懸賞區了！');
                    const create_result = yield SB_functions.autoCreateAndGetOngoingInfo(interaction.user.id, {
                        account_op: this.account_op,
                        ongoing_op: this.ongoing_op
                    });
                    if (create_result.status === shortcut_1.db.StatusCode.WRITE_DATA_ERROR)
                        return yield interaction.editReply('創建問題串失敗！');
                    else if (create_result.status === shortcut_1.db.StatusCode.WRITE_DATA_SUCCESS)
                        yield interaction.editReply('問題串已建立！');
                    else if (create_result.status === shortcut_1.db.StatusCode.DATA_FOUND)
                        yield interaction.editReply('找到問題串資料');
                    const beautified_qns_thread = yield qns_thread_beauty.beautify(create_result.qns_thread);
                    yield interaction.followUp({
                        content: `你的答題狀態：\n\n${beautified_qns_thread}`,
                        ephemeral: true
                    });
                    const qns_data = yield SB_functions.getQnsThreadData(create_result.qns_thread);
                    if (qns_data.finished)
                        return yield interaction.followUp('你已經回答完所有問題了！');
                    // ==== modify embed -> set difficulty and qns_number
                    const new_embed = yield this.getStartBountyEmbed(qns_data.curr_diffi, qns_data.curr_qns_number);
                    let msg;
                    try {
                        msg = yield interaction.user.send({
                            components: [user_interaction_1.START_BOUNTY_COMPONENTS.button],
                            embeds: [new_embed]
                        });
                    }
                    catch (_a) {
                        return yield interaction.followUp('私訊時發生錯誤，請檢察你是否有開啟此功能');
                    }
                    const button_data = {
                        _id: new mongodb_1.ObjectId(),
                        user_id: interaction.user.id,
                        channel_id: msg.channelId,
                        msg_id: msg.id,
                        qns_info: {
                            difficulty: qns_data.curr_diffi,
                            number: qns_data.curr_qns_number
                        },
                        due_time: Date.now() + 60 * 1000
                    };
                    yield (yield this.start_button_op.cursor_promise).insertOne(button_data);
                    yield shortcut_1.core.sleep(60);
                    const btn_data = yield (yield this.start_button_op.cursor_promise).findOne({ user_id: interaction.user.id });
                    if (!btn_data)
                        return;
                    const new_button = yield common_functions.getDisabledButton(user_interaction_1.START_BOUNTY_COMPONENTS.button);
                    yield msg.edit({
                        components: [new_button]
                    });
                    return yield (yield this.start_button_op.cursor_promise).deleteOne({ user_id: interaction.user.id });
                }
            }
        });
    }
    getStartBountyEmbed(diffi, qns_number) {
        return __awaiter(this, void 0, void 0, function* () {
            const new_embed = yield shortcut_1.core.cloneObj(user_interaction_1.START_BOUNTY_COMPONENTS.embed);
            new_embed.fields[0].value = diffi;
            new_embed.fields[1].value = qns_number.toString();
            return new_embed;
        });
    }
    buttonHandler(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (interaction.customId) {
                case 'start_bounty': {
                    yield interaction.deferReply();
                    const user_btn_data = yield (yield this.start_button_op.cursor_promise).findOne({ user_id: interaction.user.id });
                    if (!user_btn_data)
                        return yield interaction.editReply('錯誤，找不到驗證資訊');
                    else if (user_btn_data.msg_id !== interaction.message.id)
                        return yield interaction.editReply('驗證資訊錯誤');
                    const ongoing_data = yield (yield this.ongoing_op.cursor_promise).findOne({ user_id: interaction.user.id });
                    let stamina_execute;
                    if (ongoing_data.stamina.regular > 0) {
                        stamina_execute = {
                            $inc: {
                                "stamina.regular": -1
                            }
                        };
                    }
                    else if (ongoing_data.stamina.extra > 0) {
                        stamina_execute = {
                            $inc: {
                                "stamina.extra": -1
                            }
                        };
                    }
                    else {
                        return yield interaction.editReply('錯誤，你沒有足夠的體力！');
                    }
                    yield (yield this.ongoing_op.cursor_promise).updateOne({ user_id: interaction.user.id }, stamina_execute);
                    const diffi = user_btn_data.qns_info.difficulty;
                    const qns_number = user_btn_data.qns_info.number;
                    const new_button = yield common_functions.getDisabledButton(user_interaction_1.START_BOUNTY_COMPONENTS.button);
                    const msg = interaction.message;
                    yield msg.edit({
                        components: [new_button]
                    });
                    const delete_result = yield (yield this.start_button_op.cursor_promise).deleteOne({ user_id: interaction.user.id });
                    if (!delete_result.acknowledged)
                        return yield interaction.editReply('刪除驗證資訊時發生錯誤！');
                    // download qns pic
                    const local_file_name = `./cache/qns_pic_dl/${interaction.user.id}_${qns_number}.png`;
                    const dl_result = yield shortcut_1.db.storjDownload({
                        bucket_name: 'bounty-questions-db',
                        local_file_name: local_file_name,
                        db_file_name: `${diffi}/${qns_number}.png`
                    });
                    if (!dl_result)
                        return yield interaction.user.send('下載圖片錯誤！');
                    const buffer_time = 10;
                    const process_delay_time = 1;
                    const start_time = Date.now() + (buffer_time + process_delay_time) * 1000;
                    const end_time = Date.now() + (this.qns_diffi_time[diffi] + buffer_time + process_delay_time) * 1000;
                    const execute = {
                        $set: {
                            status: true
                        }
                    };
                    const update_result = yield (yield this.ongoing_op.cursor_promise).updateOne({ user_id: interaction.user.id }, execute);
                    if (!update_result.acknowledged) {
                        (0, fs_1.unlink)(local_file_name, () => { return; });
                        return yield interaction.user.send('開始懸賞時發生錯誤！');
                    }
                    const relativeDiscordTimestamp = (t) => { return `<t:${Math.trunc(t / 1000)}:R>`; };
                    const answering_embed = yield this.getAnsweringInfoEmbed(relativeDiscordTimestamp(start_time), relativeDiscordTimestamp(end_time));
                    yield interaction.editReply({
                        embeds: [answering_embed]
                    });
                    yield shortcut_1.core.sleep(buffer_time);
                    const qns_msg = yield interaction.user.send({
                        content: '**【題目】**注意，請勿將題目外流給他人，且答題過後建議銷毀。',
                        files: [local_file_name],
                        components: [user_interaction_1.END_BOUNTY_COMPONENTS.button]
                    });
                    (0, fs_1.unlink)(local_file_name, () => { return; });
                    const end_btn_info = {
                        _id: new mongodb_1.ObjectId(),
                        user_id: interaction.user.id,
                        channel_id: interaction.channelId,
                        msg_id: qns_msg.id,
                        time: {
                            start: start_time,
                            end: end_time
                        }
                    };
                    const create_result = yield (yield this.end_button_op.cursor_promise).insertOne(end_btn_info);
                    if (!create_result.acknowledged)
                        return yield interaction.user.send('建立結束資料時發生錯誤！');
                    break;
                }
                case 'end_bounty': {
                    yield interaction.deferReply();
                    const stop_answering_time = Date.now();
                    const user_end_btn_data = yield (yield this.end_button_op.cursor_promise).findOne({ user_id: interaction.user.id });
                    yield (yield this.end_button_op.cursor_promise).deleteOne({ user_id: interaction.user.id });
                    const channel = yield this.f_platform.f_bot.channels.fetch(user_end_btn_data.channel_id);
                    if (!(channel instanceof discord_js_1.DMChannel))
                        return;
                    const start_bounty_execute = {
                        $set: {
                            status: false
                        }
                    };
                    yield (yield this.ongoing_op.cursor_promise).updateOne({ user_id: interaction.user.id }, start_bounty_execute);
                    const msg = yield channel.messages.fetch(user_end_btn_data.msg_id);
                    const new_button = yield common_functions.getDisabledButton(user_interaction_1.END_BOUNTY_COMPONENTS.button);
                    yield msg.edit({
                        components: [new_button]
                    });
                    const user_ongoing_data = yield (yield this.ongoing_op.cursor_promise).findOne({ user_id: interaction.user.id });
                    const thread_data = yield SB_functions.getQnsThreadData(user_ongoing_data.qns_thread);
                    const choices = yield this.generateQuestionChoices(thread_data.curr_diffi, thread_data.curr_qns_number);
                    const ans_dropdown = yield this.appendChoicesToDropdown(choices);
                    const dp_msg = yield interaction.editReply({
                        content: '請選擇答案（限時30秒）',
                        components: [ans_dropdown]
                    });
                    if (!(dp_msg instanceof discord_js_1.Message))
                        return yield interaction.channel.send('err dealing with types');
                    const dp_data = {
                        _id: new mongodb_1.ObjectId(),
                        user_id: interaction.user.id,
                        channel_id: dp_msg.channelId,
                        msg_id: dp_msg.id,
                        ans_duration: stop_answering_time - user_end_btn_data.time.start
                    };
                    const create_result = yield (yield this.dropdown_op.cursor_promise).insertOne(dp_data);
                    if (!create_result.acknowledged)
                        return yield interaction.channel.send('新增dp驗證時發生錯誤！');
                    yield shortcut_1.core.sleep(30);
                    try {
                        if (!(dp_msg instanceof discord_js_1.Message))
                            return;
                        yield dp_msg.edit({
                            content: '選擇答案時間已過時',
                            components: []
                        });
                    }
                    catch (_a) {
                        return;
                    }
                }
            }
        });
    }
    getAnsweringInfoEmbed(start_time, end_time) {
        return __awaiter(this, void 0, void 0, function* () {
            const new_embed = yield shortcut_1.core.cloneObj(user_interaction_1.END_BOUNTY_COMPONENTS.embed);
            new_embed.fields[0].value = start_time;
            new_embed.fields[1].value = end_time;
            return new_embed;
        });
    }
    generateQuestionChoices(qns_diffi, qns_number) {
        return __awaiter(this, void 0, void 0, function* () {
            // ex:
            // const qns_choices = ['A', 'B', 'C', 'D', 'E', 'F'];
            // const qns_ans = ['A', 'C'];
            const qns_data = yield (yield this.qns_op.cursor_promise).findOne({
                difficulty: qns_diffi,
                number: qns_number
            });
            const qns_choices = this.alphabet_sequence.slice(0, qns_data.max_choices);
            const qns_ans = qns_data.correct_ans;
            if (qns_ans.length === 1)
                return qns_choices;
            let result = yield shortcut_1.core.getSubsetsWithCertainLength(qns_choices, qns_ans.length);
            result = result.filter((item) => { return !(shortcut_1.core.arrayEquals(item, qns_ans)); });
            result = yield shortcut_1.core.shuffle(result);
            const random_choices_count = Math.min(Math.pow(2, qns_ans.length) + 2, yield shortcut_1.core.binomialCoefficient(qns_choices.length, qns_ans.length)) - 1;
            result = result.slice(0, random_choices_count);
            result.push(qns_ans);
            result = yield shortcut_1.core.shuffle(result);
            result = result.map((item) => { return item.join(', '); });
            return result;
        });
    }
    appendChoicesToDropdown(choices) {
        return __awaiter(this, void 0, void 0, function* () {
            const new_dropdown = yield shortcut_1.core.cloneObj(user_interaction_1.END_BOUNTY_COMPONENTS.dropdown);
            for (let i = 0; i < choices.length; i++) {
                const choice = choices[i];
                const new_option = yield shortcut_1.core.cloneObj(user_interaction_1.END_BOUNTY_COMPONENTS.dropdown_option);
                new_option.label = choice;
                new_option.value = choice;
                new_dropdown.components[0].options.push(new_option);
            }
            return new_dropdown;
        });
    }
    dropdownHandler(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (interaction.customId) {
                case 'bounty_answers': {
                    yield interaction.deferReply();
                    // auth
                    const user_dp_data = yield (yield this.dropdown_op.cursor_promise).findOne({ user_id: interaction.user.id });
                    if (!user_dp_data)
                        return yield interaction.editReply('找不到驗證資訊！');
                    if (user_dp_data.channel_id !== interaction.channelId)
                        return yield interaction.editReply('驗證資訊錯誤！');
                    if (user_dp_data.msg_id !== interaction.message.id)
                        return yield interaction.editReply('驗證資訊錯誤！');
                    yield (yield this.dropdown_op.cursor_promise).deleteOne({ user_id: interaction.user.id });
                    //
                    // fetch data
                    const user_ongoing_info = yield (yield this.ongoing_op.cursor_promise).findOne({ user_id: interaction.user.id });
                    const thread_data = yield SB_functions.getQnsThreadData(user_ongoing_info.qns_thread);
                    const qns_data = yield (yield this.qns_op.cursor_promise).findOne({
                        difficulty: thread_data.curr_diffi,
                        number: thread_data.curr_qns_number
                    });
                    //
                    yield interaction.editReply({
                        content: `你選擇的答案是：${interaction.values[0]}`,
                        components: []
                    });
                    const correct = this.isUserCorrect(interaction, qns_data.correct_ans);
                    if (correct)
                        yield interaction.channel.send('這是正確答案');
                    else
                        yield interaction.channel.send('這不是正確答案！');
                    const give_result = yield this.giveExp(correct, thread_data.curr_diffi, interaction.user.id);
                    if (give_result.status === shortcut_1.db.StatusCode.WRITE_DATA_SUCCESS)
                        yield interaction.channel.send(`恭喜獲得 ${give_result.delta_exp} exp`);
                    else
                        yield interaction.channel.send(`給你 ${give_result.delta_exp} exp 時發生錯誤了！`);
                    let new_thread = undefined;
                    if (correct) {
                        const result = yield this.updateQnsThread(interaction.user.id, user_ongoing_info.qns_thread, thread_data.curr_diffi);
                        if (result.status === shortcut_1.db.StatusCode.WRITE_DATA_ERROR)
                            yield interaction.channel.send('更新問題串時發生錯誤');
                        new_thread = result.new_thread;
                    }
                    const stat_result = yield this.updateStatistics(interaction.user.id, correct, thread_data.curr_diffi, thread_data.curr_qns_number, new_thread);
                    if (!stat_result)
                        yield interaction.channel.send('更新統計資料時發生錯誤');
                    if (!correct)
                        return;
                    // extra stamina
                    const can_gain_ext_stamina = yield this.canUserGainExtraStamina(user_dp_data.ans_duration, this.qns_diffi_time[thread_data.curr_diffi], this.qns_ext_stamina_portion[thread_data.curr_diffi]);
                    if (!can_gain_ext_stamina)
                        return;
                    return yield this.giveExtraStamina(interaction, user_ongoing_info.stamina.extra_gained);
                }
            }
        });
    }
    isUserCorrect(interaction, correct_ans) {
        const user_choice = interaction.values[0].split(', ');
        const correct = shortcut_1.core.arrayEquals(user_choice, correct_ans);
        return correct;
    }
    giveExp(correct, diffi, user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            let delta_exp;
            if (!correct)
                delta_exp = 2;
            else
                delta_exp = this.qns_diffi_exp[diffi];
            const execute = {
                $inc: {
                    exp: delta_exp
                }
            };
            const update_result = yield (yield this.account_op.cursor_promise).updateOne({ user_id: user_id }, execute);
            let status;
            if (update_result.acknowledged)
                status = shortcut_1.db.StatusCode.WRITE_DATA_SUCCESS;
            else
                status = shortcut_1.db.StatusCode.WRITE_DATA_ERROR;
            return {
                status: status,
                delta_exp: delta_exp
            };
        });
    }
    updateQnsThread(user_id, user_qns_thread, diffi) {
        return __awaiter(this, void 0, void 0, function* () {
            user_qns_thread[diffi].shift();
            const execute = {
                $set: {
                    [`qns_thread.${diffi}`]: user_qns_thread[diffi]
                }
            };
            const update_result = yield (yield this.ongoing_op.cursor_promise).updateOne({ user_id: user_id }, execute);
            let status;
            if (update_result.acknowledged)
                status = shortcut_1.db.StatusCode.WRITE_DATA_SUCCESS;
            else
                status = shortcut_1.db.StatusCode.WRITE_DATA_ERROR;
            return {
                status: status,
                new_thread: user_qns_thread
            };
        });
    }
    updateStatistics(user_id, correct, qns_diffi, qns_number, new_thread) {
        return __awaiter(this, void 0, void 0, function* () {
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
            if (cleared_execute === undefined) {
                const execute_result = yield (yield this.account_op.cursor_promise).updateOne({ user_id: user_id }, execute);
                final_result = execute_result.acknowledged;
            }
            else {
                const execute_result = yield (yield this.account_op.cursor_promise).updateOne({ user_id: user_id }, execute);
                const cleared_result = yield (yield this.account_op.cursor_promise).updateOne({ user_id: user_id }, cleared_execute);
                final_result = (execute_result.acknowledged && cleared_result.acknowledged);
            }
            return final_result;
        });
    }
    canUserGainExtraStamina(ans_duration, qns_max_time, duration_portion) {
        return __awaiter(this, void 0, void 0, function* () {
            return (ans_duration / 1000 <= qns_max_time * duration_portion);
        });
    }
    giveExtraStamina(interaction, gained_extra_stamina) {
        return __awaiter(this, void 0, void 0, function* () {
            if (gained_extra_stamina < 2) {
                const execute = {
                    $inc: {
                        "stamina.extra": 1,
                        "stamina.extra_gained": 1
                    }
                };
                yield (yield this.ongoing_op.cursor_promise).updateOne({ user_id: interaction.user.id }, execute);
                yield interaction.channel.send('恭喜獲得1個額外體力！');
            }
            else {
                const execute = {
                    $inc: {
                        exp: 10
                    }
                };
                yield (yield this.account_op.cursor_promise).updateOne({ user_id: interaction.user.id }, execute);
                yield interaction.channel.send(`因為你的額外體力已經爆滿，因此自動將新的額外體力轉化成 10 exp`);
            }
        });
    }
}
exports.BountyEventManager = BountyEventManager;
const SB_functions = {
    autoCreateAndGetOngoingInfo(user_id, ops) {
        return __awaiter(this, void 0, void 0, function* () {
            const data_exists = yield ops.ongoing_op.checkDataExistence({ user_id: user_id });
            if (data_exists.status === shortcut_1.db.StatusCode.DATA_FOUND) {
                const user_ongoing_info = yield (yield ops.ongoing_op.cursor_promise).findOne({ user_id: user_id });
                return {
                    status: data_exists.status,
                    qns_thread: user_ongoing_info.qns_thread
                };
            }
            const new_qns_thread = yield this.createQnsThread(user_id, ops);
            const create_result = yield ops.ongoing_op.createDefaultData({
                user_id: user_id,
                qns_thread: new_qns_thread
            });
            return {
                status: create_result.status,
                qns_thread: new_qns_thread
            };
        });
    },
    createQnsThread(user_id, ops) {
        return __awaiter(this, void 0, void 0, function* () {
            const user_main_acc = yield (yield ops.account_op.cursor_promise).findOne({ user_id: user_id });
            const db_cache_operator = new shortcut_1.core.BaseOperator({
                db: 'Bounty',
                coll: 'StorjQnsDBCache'
            });
            const cache = yield (yield db_cache_operator.cursor_promise).findOne({ type: 'cache' });
            const diffi_list = ['easy', 'medium', 'hard'];
            const new_qns_thread = {
                easy: undefined,
                medium: undefined,
                hard: undefined
            };
            yield shortcut_1.core.asyncForEach(diffi_list, (diffi) => __awaiter(this, void 0, void 0, function* () {
                const max_num = cache[diffi].max_number;
                const skipped_nums = cache[diffi].skipped_numbers;
                const not_answered = [];
                const answered = user_main_acc.qns_record.answered_qns_number[diffi];
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
                yield shortcut_1.core.shuffle(not_answered);
                const max_qns_count = Math.min(3, not_answered.length);
                new_qns_thread[diffi] = not_answered.slice(0, max_qns_count);
            }));
            return new_qns_thread;
        });
    },
    getQnsThreadData(qns_thread) {
        return __awaiter(this, void 0, void 0, function* () {
            const diffi_list = ['easy', 'medium', 'hard'];
            let curr_diffi;
            let curr_qns_number;
            for (let i = 0; i < diffi_list.length; i++) {
                const diffi = diffi_list[i];
                if (qns_thread[diffi].length === 0)
                    continue;
                curr_diffi = diffi;
                curr_qns_number = qns_thread[diffi][0];
                break;
            }
            if (curr_diffi === undefined)
                return {
                    finished: true
                };
            return {
                finished: false,
                curr_diffi: curr_diffi,
                curr_qns_number: curr_qns_number
            };
        });
    }
};
const common_functions = {
    getDisabledButton(obj) {
        return __awaiter(this, void 0, void 0, function* () {
            const new_button = yield shortcut_1.core.cloneObj(obj);
            new_button.components[0].disabled = true;
            return new_button;
        });
    }
};
class EndBountySessionManager extends session.SessionManager {
    constructor(f_platform) {
        const session_config = {
            session_name: 'end_bounty',
            interval_data: {
                idle: 4,
                normal: 2,
                fast: 1
            }
        };
        super(f_platform, session_config);
        this.ongoing_op = new shortcut_1.core.BountyUserOngoingInfoOperator();
        this.end_button_op = new shortcut_1.core.BaseOperator({
            db: 'Bounty',
            coll: 'EndButtonPipeline'
        });
        this.event.on('sessionExpired', (session_data) => __awaiter(this, void 0, void 0, function* () {
            yield this.doAfterExpired(session_data);
        }));
        this.f_platform.f_bot.on('ready', () => __awaiter(this, void 0, void 0, function* () {
            yield this.setupCache();
        }));
    }
    setupCache() {
        return __awaiter(this, void 0, void 0, function* () {
            const self_routine = (t) => setTimeout(() => __awaiter(this, void 0, void 0, function* () { yield this.setupCache(); }), t * 1000);
            if (!this.connected)
                return self_routine(1);
            let cache_data = yield this.getData();
            if (cache_data === null) {
                yield this.writeData([]);
                cache_data = yield this.getData();
            }
            const cached_user_id = [];
            if (cache_data.length !== 0) {
                for (let i = 0; i < cache_data.length; i++) {
                    const user_acc = yield (yield this.ongoing_op.cursor_promise).findOne({ user_id: cache_data[i].id });
                    if (!user_acc.status) {
                        cache_data.splice(i, 1);
                        continue;
                    }
                    cached_user_id.push(cache_data[i].id);
                }
            }
            const end_btn_data = yield (yield this.end_button_op.cursor_promise).find({}).toArray();
            for (let i = 0; i < end_btn_data.length; i++) {
                const data = end_btn_data[i];
                if (data.time.end > Date.now() + 150 * 1000)
                    continue;
                if (yield shortcut_1.core.isItemInArray(data.user_id, cached_user_id))
                    continue;
                cache_data.push({
                    id: data.user_id,
                    expired_date: data.time.end
                });
                console.log('cache pushed', {
                    id: data.user_id,
                    expired_date: data.time.end
                });
            }
            cache_data.sort((a, b) => a.expired_date - b.expired_date);
            yield this.writeData(cache_data);
            return self_routine(10);
        });
    }
    doAfterExpired(session_data) {
        return __awaiter(this, void 0, void 0, function* () {
            const end_btn_data = yield (yield this.end_button_op.cursor_promise).findOne({ user_id: session_data.id });
            if (end_btn_data) {
                const channel = yield this.f_platform.f_bot.channels.fetch(end_btn_data.channel_id);
                if (!(channel instanceof discord_js_1.DMChannel))
                    return;
                const msg = yield channel.messages.fetch(end_btn_data.msg_id);
                const new_button = yield common_functions.getDisabledButton(user_interaction_1.END_BOUNTY_COMPONENTS.button);
                yield msg.edit({
                    content: '已超過可回答時間',
                    files: [],
                    components: [new_button]
                });
                const status_execute = {
                    $set: {
                        status: false
                    }
                };
                yield (yield this.ongoing_op.cursor_promise).updateOne({ user_id: session_data.id }, status_execute);
                yield (yield this.end_button_op.cursor_promise).deleteOne({ user_id: session_data.id });
            }
            return;
        });
    }
}
exports.EndBountySessionManager = EndBountySessionManager;
