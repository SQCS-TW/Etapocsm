import { Message } from 'discord.js';
import { ChatExpPlatform } from '../../platforms/chat_exp';
import { core, db } from '../../shortcut';


export class ChatListener extends core.BaseManager {
    public f_platform: ChatExpPlatform;

    constructor(f_platform: ChatExpPlatform) {
        super();
        this.f_platform = f_platform;

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

        const check_result = await this.f_platform.account_op.isUserInCooldown(msg.member.id);
        if (check_result.status === db.StatusCode.WRITE_DATA_ERROR) return core.critical_logger.error({
            message: '[Chat-exp] 建立用戶帳號時發生錯誤了',
            metadata: {
                user_id: msg.author.id,
                err_code: db.StatusCode.WRITE_DATA_ERROR
            }
        });

        if (check_result.status === true) return;

        const user_main_lvl_acc = await (await this.f_platform.mainlvl_acc_op.cursor).findOne({ user_id: msg.author.id });
        const exp_multiplier = user_main_lvl_acc?.exp_multiplier ?? 1;

        const REWARD_EXP = Math.round(core.getRandomInt(2) * exp_multiplier);

        let set_result = await this.f_platform.account_op.addExp(msg.member.id, REWARD_EXP);
        if (set_result.status === db.StatusCode.WRITE_DATA_ERROR) return core.critical_logger.error({
            message: '[Chat-exp] 給予成員經驗值時發生錯誤了',
            metadata: {
                player_id: msg.author.id,
                delta_exp: REWARD_EXP,
                err_code: db.StatusCode.WRITE_DATA_ERROR
            }
        });
        else core.normal_logger.info({
            message: '[Chat-exp] 成員已獲得聊天經驗值',
            metadata: {
                player_name: msg.member.displayName,
                delta_exp: REWARD_EXP
            }
        });

        const COOLDOWN = core.timeAfterSecs(60);
        set_result = await this.f_platform.account_op.setCooldown(msg.member.id, COOLDOWN);
        if (set_result.status === db.StatusCode.WRITE_DATA_ERROR) return core.critical_logger.error({
            message: '[Chat-exp] 設定成員冷卻時間時發生錯誤了',
            metadata: {
                player_id: msg.author.id,
                cooldown: COOLDOWN,
                err_code: db.StatusCode.WRITE_DATA_ERROR
            }
        });
    }
}
