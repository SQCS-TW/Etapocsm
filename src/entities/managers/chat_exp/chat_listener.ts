import { Message } from 'discord.js';
import { core, db } from '../../shortcut';


export class ChatListener extends core.BaseManager {
    private account_op = new core.ChatAccountOperator();

    constructor(f_platform: core.BasePlatform) {
        super(f_platform);

        this.setupListener();
    }

    private setupListener() {
        this.f_platform.f_bot.on('messageCreate', async (msg) => {
            if (!msg.inGuild()) return;
            await this.messageHandler(msg);
        });
    }

    public async messageHandler(msg: Message) {
        if (msg.author.bot) return;
        if (msg.guildId !== "743507979369709639") return;

        const check_result = await this.account_op.isUserInCooldown(msg.member.id);
        if (check_result.status === db.StatusCode.WRITE_DATA_ERROR) {
            return core.logger.error('error creating user chat account', msg.member.id);
        }

        if (check_result.status === true) return;

        const REWARD_EXP = await core.getRandomInt(2);
        core.logger.debug(`dexp: ${REWARD_EXP}`);
        let set_result = await this.account_op.addExp(msg.member.id, REWARD_EXP);
        if (set_result.status === db.StatusCode.WRITE_DATA_ERROR) {
            core.logger.error(`error giving user exp ${msg.member.id} ${REWARD_EXP}`);
            return;
        }

        const COOLDOWN = core.timeAfterSecs(60);
        set_result = await this.account_op.setCooldown(msg.member.id, COOLDOWN);
        if (set_result.status === db.StatusCode.WRITE_DATA_ERROR) {
            core.logger.error(`error setting cooldown ${msg.member.id} ${COOLDOWN}`);
            return;
        }
    }
}
