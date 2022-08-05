"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BountyUIManager = exports.makeBountyBannerButtons = exports.makeBountyBannerEmbed = void 0;
const discord_js_1 = require("discord.js");
const shortcut_1 = require("../../shortcut");
const date_fns_1 = require("date-fns");
const date_fns_tz_1 = require("date-fns-tz");
const bounty_embed = new discord_js_1.MessageEmbed()
    .setTitle('懸賞區選單')
    .setColor('#ffffff')
    .setImage('https://i.imgur.com/y4Iy9qd.jpg')
    .setFooter({ text: '如要開始遊玩，請先註冊帳號' });
const reg_btn = new discord_js_1.MessageButton()
    .setEmoji('🧾')
    .setLabel('註冊帳號')
    .setCustomId('create-main-bounty-account')
    .setStyle('PRIMARY');
const start_btn = new discord_js_1.MessageButton()
    .setEmoji('🕹️')
    .setLabel('開始遊玩')
    .setCustomId('start-bounty')
    .setStyle('SUCCESS');
const data_btn = new discord_js_1.MessageButton()
    .setEmoji('📑')
    .setLabel('查看帳號數據')
    .setCustomId('check-account-data')
    .setStyle('PRIMARY');
const acc_btn = new discord_js_1.MessageButton()
    .setEmoji('📜')
    .setLabel('查看遊玩紀錄')
    .setCustomId('check-personal-record')
    .setStyle('PRIMARY');
const play_info_btn = new discord_js_1.MessageButton()
    .setEmoji('🤔')
    .setLabel('遊玩方式')
    .setStyle('LINK')
    .setURL('https://hackmd.io/@Quantami/lvl-sys-intro');
const makeBountyBannerEmbed = () => {
    const curr_time = (0, date_fns_tz_1.utcToZonedTime)(Date.now(), 'Asia/Taipei');
    const end_of_week_time = (0, date_fns_1.addHours)((0, date_fns_1.endOfWeek)(curr_time), -2);
    const stamina_refresh_time = (0, date_fns_1.addMinutes)(end_of_week_time, 30);
    const stamina_refresh_timestamp = shortcut_1.core.discord.getRelativeTimestamp(stamina_refresh_time.getTime());
    const qns_thread_refresh_time = (0, date_fns_1.addHours)((0, date_fns_1.endOfMonth)(curr_time), 6);
    const qns_thread_refresh_timestamp = shortcut_1.core.discord.getRelativeTimestamp(qns_thread_refresh_time.getTime());
    const new_embed = new discord_js_1.MessageEmbed(bounty_embed)
        .addField('問題串刷新時間', qns_thread_refresh_timestamp, true)
        .addField('體力更新時間', stamina_refresh_timestamp, true);
    return new_embed;
};
exports.makeBountyBannerEmbed = makeBountyBannerEmbed;
const makeBountyBannerButtons = () => {
    return shortcut_1.core.discord.compAdder([
        [reg_btn, play_info_btn, start_btn],
        [data_btn, acc_btn]
    ]);
};
exports.makeBountyBannerButtons = makeBountyBannerButtons;
class BountyUIManager extends shortcut_1.core.BaseManager {
    constructor(f_platform) {
        super();
        this.f_platform = f_platform;
        this.setupListener();
    }
    setupListener() {
        this.f_platform.f_bot.on('messageCreate', async (msg) => {
            if (msg.author.id !== '610327503671656449')
                return;
            await this.messageHandler(msg);
        });
    }
    async messageHandler(msg) {
        switch (msg.content) {
            case 'send-bounty-banner': {
                await msg.channel.send({
                    embeds: [(0, exports.makeBountyBannerEmbed)()],
                    components: (0, exports.makeBountyBannerButtons)()
                });
            }
        }
    }
}
exports.BountyUIManager = BountyUIManager;
