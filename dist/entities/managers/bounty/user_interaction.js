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
exports.BountyAccountManager = void 0;
const user_interaction_1 = require("./slcmd/user_interaction");
const shortcut_1 = require("../../shortcut");
class BountyAccountManager extends shortcut_1.core.BaseManager {
    constructor(f_platform) {
        super(f_platform);
        this.account_op = new shortcut_1.core.BountyUserAccountOperator();
        this.ongoing_op = new shortcut_1.core.BountyUserOngoingInfoOperator();
        this.SLCMD_REGISTER_LIST = user_interaction_1.ACCOUNT_MANAGER_SLCMD;
        this.setupListener();
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
                    else
                        return yield interaction.editReply('帳號建立成功！');
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
