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
const mongodb_1 = require("mongodb");
const qns_db_1 = require("./slcmd/qns_db");
const shortcut_1 = require("../../shortcut");
class BountyQnsDBManager extends shortcut_1.core.BaseManager {
    constructor(f_platform) {
        super(f_platform);
        this.qns_op = new shortcut_1.core.ChatAccountOperator();
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
                case 'activate': {
                    yield interaction.deferReply({ ephemeral: true });
                    for (const diffi of ['easy', 'medium', 'hard']) {
                        const file_names = yield shortcut_1.db.getFolderFiles({
                            bucket_name: 'bounty-questions-db',
                            prefix: `${diffi}/`,
                            suffixes: '.png-.jpg'
                        });
                        for (let i = 0; i < file_names.length; i++) {
                            file_names[i] = file_names[i]
                                .replace(".png", '')
                                .replace(".jpg", '');
                        }
                        const cursor = yield (new shortcut_1.db.Mongo('Bounty')).getCur('Questions');
                        for (const file_name of file_names) {
                            const qns_data = {
                                _id: new mongodb_1.ObjectId(),
                                qns_id: file_name,
                                difficulty: diffi,
                                choices: [],
                                ans: [],
                                time_avail: 150
                            };
                            yield cursor.insertOne(qns_data);
                        }
                    }
                    yield interaction.editReply(':white_check_mark: 問題資料庫已建立！');
                    break;
                }
                case 'modify_choices': {
                    yield interaction.deferReply({ ephemeral: true });
                    const qns_id = interaction.options.getString('id');
                    const qns_choices = (interaction.options.getString('choices')).split(';');
                    const cursor = yield (new shortcut_1.db.Mongo('Bounty')).getCur('Questions');
                    const execute = {
                        $set: {
                            choices: qns_choices
                        }
                    };
                    yield cursor.updateOne({ qns_id: qns_id }, execute);
                    yield interaction.editReply(':white_check_mark: 問題選項已修改！');
                    break;
                }
                case 'modify_answers': {
                    yield interaction.deferReply({ ephemeral: true });
                    const qns_id = interaction.options.getString('id');
                    const qns_ans = (interaction.options.getString('ans')).split(';');
                    const cursor = yield (new shortcut_1.db.Mongo('Bounty')).getCur('Questions');
                    const execute = {
                        $set: {
                            ans: qns_ans
                        }
                    };
                    yield cursor.updateOne({ qns_id: qns_id }, execute);
                    yield interaction.editReply(':white_check_mark: 問題答案已修改！');
                    break;
                }
            }
        });
    }
}
exports.BountyQnsDBManager = BountyQnsDBManager;
