import { Message } from 'discord.js';
import { core } from '../../sc';


class ChatListener extends core.BaseListener {
    private account_op: core.ChatAccountOperator;
    
    constructor(father_platform: core.BasePlatform) {
        super(father_platform);
        this.account_op = new core.ChatAccountOperator();
    }

    public async messageHandler(msg: Message) {
        const check_result = await this.account_op.checkUserDataExistence(msg.member.id, true);
        if (!check_result.status) {
            return console.log('error creating user chat account', msg.member.id);
        } 

        if (await this.account_op.isUserInCooldown(msg.member.id)) return;

        const REWARD_EXP = await core.getRandomInt(2) + 1;
        let set_result = await this.account_op.addExp(msg.member.id, REWARD_EXP);
        if (!set_result.status) {
            console.log('error giving user exp', msg.member.id, REWARD_EXP);
            return;
        }

        const COOLDOWN = await core.timeAfterSecs(60);
        set_result = await this.account_op.setCooldown(msg.member.id, COOLDOWN);
        if (!set_result.status) {
            console.log('error setting cooldown', msg.member.id, COOLDOWN);
            return;
        }
    }
}


export {
    ChatListener
};
