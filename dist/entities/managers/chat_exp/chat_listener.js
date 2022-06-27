"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatListener = void 0;
const shortcut_1 = require("../../shortcut");
class ChatListener extends shortcut_1.core.BaseManager {
    constructor(f_platform) {
        super(f_platform);
        this.account_op = new shortcut_1.core.ChatAccountOperator();
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
        const check_result = await this.account_op.isUserInCooldown(msg.member.id);
        if (check_result.status === shortcut_1.db.StatusCode.WRITE_DATA_ERROR) {
            return console.log('error creating user chat account', msg.member.id);
        }
        if (check_result.status === true)
            return;
        const REWARD_EXP = await shortcut_1.core.getRandomInt(2);
        console.log(REWARD_EXP);
        let set_result = await this.account_op.addExp(msg.member.id, REWARD_EXP);
        if (set_result.status === shortcut_1.db.StatusCode.WRITE_DATA_ERROR) {
            console.log('error giving user exp', msg.member.id, REWARD_EXP);
            return;
        }
        const COOLDOWN = shortcut_1.core.timeAfterSecs(60);
        set_result = await this.account_op.setCooldown(msg.member.id, COOLDOWN);
        if (set_result.status === shortcut_1.db.StatusCode.WRITE_DATA_ERROR) {
            console.log('error setting cooldown', msg.member.id, COOLDOWN);
            return;
        }
    }
}
exports.ChatListener = ChatListener;
