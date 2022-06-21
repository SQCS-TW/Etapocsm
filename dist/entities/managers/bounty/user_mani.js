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
exports.BountyUserManiManager = void 0;
const user_mani_1 = require("./components/user_mani");
const shortcut_1 = require("../../shortcut");
class BountyUserManiManager extends shortcut_1.core.BaseManager {
    constructor(f_platform) {
        super(f_platform);
        this.account_op = new shortcut_1.core.BountyUserAccountOperator();
        this.setupListener();
        this.SLCMD_REGISTER_LIST = user_mani_1.REGISTER_LIST;
    }
    setupListener() {
        this.f_platform.f_bot.on('interactionCreate', (interaction) => __awaiter(this, void 0, void 0, function* () {
            if (!interaction.inGuild())
                return;
            if (!(this.checkPerm(interaction, 'ADMINISTRATOR')))
                return;
            if (interaction.isCommand())
                yield this.slcmdHandler(interaction);
        }));
    }
    slcmdHandler(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (interaction.commandName) {
                case 'mani-bounty-auth': {
                    yield interaction.deferReply();
                    const user_id = interaction.options.getString('id');
                    const new_auth = interaction.options.getBoolean('new-auth');
                    const result = yield this.account_op.setAuth(user_id, new_auth);
                    yield interaction.editReply(result.message);
                }
            }
        });
    }
}
exports.BountyUserManiManager = BountyUserManiManager;
