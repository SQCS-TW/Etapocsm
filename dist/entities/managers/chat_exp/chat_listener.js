"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatListener = void 0;
const shortcut_1 = require("../../shortcut");
class ChatListener extends shortcut_1.core.BaseManager {
    constructor(f_platform) {
        super();
        this.f_platform = f_platform;
        this.setupListener();
    }
    setupListener() {
        this.f_platform.f_bot.on('messageCreate', async (msg) => {
            if (!msg.inGuild())
                return;
            await this.messageHandler(msg);
        });
    }
    async messageHandler(msg) {
        if (msg.author.bot)
            return;
        if (msg.guildId !== "743507979369709639")
            return;
        const check_result = await this.f_platform.account_op.isUserInCooldown(msg.member.id);
        if (check_result.status === shortcut_1.db.StatusCode.WRITE_DATA_ERROR) {
            return shortcut_1.core.logger.error('error creating user chat account', msg.member.id);
        }
        if (check_result.status === true)
            return;
        const user_main_lvl_acc = await (await this.f_platform.mainlvl_acc_op.cursor).findOne({ user_id: msg.author.id });
        const exp_multiplier = user_main_lvl_acc.exp_multiplier;
        const REWARD_EXP = Math.round(shortcut_1.core.getRandomInt(2) * exp_multiplier);
        shortcut_1.core.logger.debug(`[${msg.member.displayName}]<${msg.member.id}> delta_exp: ${REWARD_EXP}`);
        let set_result = await this.f_platform.account_op.addExp(msg.member.id, REWARD_EXP);
        if (set_result.status === shortcut_1.db.StatusCode.WRITE_DATA_ERROR) {
            shortcut_1.core.logger.error(`error giving user exp ${msg.member.id} ${REWARD_EXP}`);
            return;
        }
        const COOLDOWN = shortcut_1.core.timeAfterSecs(60);
        set_result = await this.f_platform.account_op.setCooldown(msg.member.id, COOLDOWN);
        if (set_result.status === shortcut_1.db.StatusCode.WRITE_DATA_ERROR) {
            shortcut_1.core.logger.error(`error setting cooldown ${msg.member.id} ${COOLDOWN}`);
            return;
        }
    }
}
exports.ChatListener = ChatListener;
