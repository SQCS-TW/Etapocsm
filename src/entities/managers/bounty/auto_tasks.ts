import { core } from '../../shortcut';
import { schedule } from 'node-cron';
import { utcToZonedTime } from 'date-fns-tz';
import { makeBountyBannerEmbed } from './ui';


export class AutoManager extends core.BaseManager {

    private ongoing_op = new core.BountyUserOngoingInfoOperator();

    private BOUNTY_BANNER_CHANNEL_ID = '991731828845195324';
    private BOUNTY_BANNER_MSG_ID = '992659965556818100';

    constructor(f_platform: core.BasePlatform) {
        super(f_platform);

        schedule('30 22 * * *', async () => { await this.refreshStamina(); });
        schedule('0 0 * * *', async () => { await this.refreshBanner(); });
    }

    private async refreshStamina() {
        const curr_time = utcToZonedTime(Date.now(), 'Asia/Taipei');
        if (curr_time.getDay() % 7 !== 6) return;

        const reset_stamina = {
            $set: {
                stamina: {
                    regular: 3,
                    extra: 0,
                    extra_gained: 0
                }
            }
        };

        await (await this.ongoing_op.cursor).updateMany({}, reset_stamina);
    }

    private async refreshBanner() {
        const curr_time = utcToZonedTime(Date.now(), 'Asia/Taipei');
        if (curr_time.getDay() % 7 !== 0) return;

        const main_guild = await this.f_platform.f_bot.guilds.fetch(core.GuildId.MAIN);
        const banner_channel = await main_guild.channels.fetch(this.BOUNTY_BANNER_CHANNEL_ID);
        
        if (!banner_channel.isText()) return;

        const banner_msg = await banner_channel.messages.fetch(this.BOUNTY_BANNER_MSG_ID);
        
        await banner_msg.edit({
            embeds: [makeBountyBannerEmbed()]
        });
    }
}
