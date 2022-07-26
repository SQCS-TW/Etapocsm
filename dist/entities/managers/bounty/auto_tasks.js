"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoManager = void 0;
const shortcut_1 = require("../../shortcut");
const node_cron_1 = require("node-cron");
const date_fns_tz_1 = require("date-fns-tz");
const ui_1 = require("./ui");
class AutoManager extends shortcut_1.core.BaseManager {
    constructor(f_platform) {
        super(f_platform);
        this.ongoing_op = new shortcut_1.core.BountyUserOngoingInfoOperator();
        this.BOUNTY_BANNER_CHANNEL_ID = '991731828845195324';
        this.BOUNTY_BANNER_MSG_ID = '992659965556818100';
        (0, node_cron_1.schedule)('30 22 * * *', async () => { await this.refreshStamina(); });
        (0, node_cron_1.schedule)('47 11 * * *', async () => { await this.refreshBanner(); });
    }
    async refreshStamina() {
        const curr_time = (0, date_fns_tz_1.utcToZonedTime)(Date.now(), 'Asia/Taipei');
        if (curr_time.getDay() % 7 !== 6)
            return;
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
    async refreshBanner() {
        const curr_time = (0, date_fns_tz_1.utcToZonedTime)(Date.now(), 'Asia/Taipei');
        const main_guild = await this.f_platform.f_bot.guilds.fetch(shortcut_1.core.GuildId.MAIN);
        const banner_channel = await main_guild.channels.fetch(this.BOUNTY_BANNER_CHANNEL_ID);
        if (!banner_channel.isText())
            return;
        const banner_msg = await banner_channel.messages.fetch(this.BOUNTY_BANNER_MSG_ID);
        await banner_msg.edit({
            embeds: [(0, ui_1.makeBountyBannerEmbed)()]
        });
    }
}
exports.AutoManager = AutoManager;
