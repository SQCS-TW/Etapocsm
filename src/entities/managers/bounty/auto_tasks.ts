import { core } from '../../shortcut';
import { makeBountyBannerEmbed, makeBountyBannerButtons } from './ui';
import { BountyPlatform } from '../../platforms/bounty';

import { Message } from 'discord.js';
import { schedule } from 'node-cron';
import { utcToZonedTime } from 'date-fns-tz';
import { endOfMonth } from 'date-fns';


export class AutoManager extends core.BaseManager {
    public f_platform: BountyPlatform;
    
    private readonly BOUNTY_BANNER_CHANNEL_ID = '991731828845195324';
    private readonly BOUNTY_BANNER_MSG_ID = '1005100098952376420';

    constructor(f_platform: BountyPlatform) {
        super();
        this.f_platform = f_platform;

        // default: 22:30
        schedule('30 22 * * *', async () => { await this.checkRefreshStamina(); });
        
        // default: 00:00
        schedule('0 0 * * *', async () => { await this.checkRefreshBanner(); });

        // default: 23:00
        schedule('0 23 * * *', async () => { await this.checkRefreshOngoing(); });

        this.setupListener();
    }

    private setupListener() {
        this.f_platform.f_bot.on('messageCreate', async (msg) => {
            if (msg.member?.permissions?.any('ADMINISTRATOR')) await this.messageHandler(msg);
        });
    }

    private async messageHandler(msg: Message) {
        switch(msg.content) {
            case 'e:REFRESH-BOUNTY-STAMINA': return await this.refreshStamina();
            case 'e:REFRESH-BOUNTY-BANNER': return await this.refreshBanner();
            case 'e:REFRESH-BOUNTY-ONGOING': return await this.refreshOngoing();
        }
    }

    private async checkRefreshStamina() {
        const curr_time = utcToZonedTime(Date.now(), 'Asia/Taipei');
        if (curr_time.getDay() === 6) await this.refreshStamina();
    }

    private async checkRefreshBanner() {
        const curr_time = utcToZonedTime(Date.now(), 'Asia/Taipei');
        if (curr_time.getDay() % 7 === 0) await this.refreshBanner();
    }

    private async checkRefreshOngoing() {
        const curr_time = utcToZonedTime(Date.now(), 'Asia/Taipei');
        const end_of_month = endOfMonth(curr_time);
        if (curr_time.getDate() === end_of_month.getDate()) await this.refreshOngoing();
    }

    private async refreshStamina() {
        const reset_stamina = {
            $set: {
                stamina: {
                    regular: 3,
                    extra: 0,
                    extra_gained: 0
                }
            }
        };

        await (await this.f_platform.ongoing_op.cursor).updateMany({}, reset_stamina);
        core.normal_logger.info('[Bounty] 活動體力值已重置');
    }

    private async refreshBanner() {
        const main_guild = await this.f_platform.f_bot.guilds.fetch(core.GuildId.MAIN);
        const banner_channel = await main_guild.channels.fetch(this.BOUNTY_BANNER_CHANNEL_ID);
        
        if (!banner_channel.isText()) return;

        const banner_msg = await banner_channel.messages.fetch(this.BOUNTY_BANNER_MSG_ID);
        
        await banner_msg.edit({
            embeds: [makeBountyBannerEmbed()],
            components: makeBountyBannerButtons()
        });
        core.normal_logger.info('[Bounty] 活動橫幅已更新');
    }

    private async refreshOngoing() {
        await (await this.f_platform.ongoing_op.cursor).deleteMany({});
        core.normal_logger.info('[Bounty] 問題串已刷新（成員進行中資料已刪除˙）');
    }
}
