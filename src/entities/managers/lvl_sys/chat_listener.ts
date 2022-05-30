import { Message } from 'discord.js';
import { core } from '../../sc';


class ChatListener extends core.BaseManager {
    private account_op: core.ChatAccountOperator;

    constructor(f_platform: core.BasePlatform) {
        super(f_platform);
        this.account_op = new core.ChatAccountOperator();

        this.setupListener();
    }

    private setupListener() {
        this.f_platform.f_bot.on('message', async (msg) => {
            await this.messageHandler(msg);
        });
    }

    public async messageHandler(msg: Message) {
        const check_result = await this.account_op.isUserInCooldown(msg.member.id);
        if (check_result.status === 'M002') {
            return console.log('error finding user chat account', msg.member.id);
        }

        if (check_result.status === true) return;

        const REWARD_EXP = await core.getRandomInt(2) + 1;
        let set_result = await this.account_op.addExp(msg.member.id, REWARD_EXP);
        if (set_result.status === 'M003') {
            console.log('error giving user exp', msg.member.id, REWARD_EXP);
            return;
        }

        const COOLDOWN = await core.timeAfterSecs(60);
        set_result = await this.account_op.setCooldown(msg.member.id, COOLDOWN);
        if (set_result.status === 'M003') {
            console.log('error setting cooldown', msg.member.id, COOLDOWN);
            return;
        }
    }
}


export {
    ChatListener
};
