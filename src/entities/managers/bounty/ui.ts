import { Message, MessageButton, MessageEmbed } from 'discord.js';
import { core } from '../../shortcut';
import { endOfWeek, addHours, endOfMonth, addMinutes } from 'date-fns';

import { utcToZonedTime } from 'date-fns-tz';
import { BountyPlatform } from '../../platforms/bounty';

const bounty_embed = new MessageEmbed()
    .setTitle('懸賞區選單')
    .setColor('#ffffff')
    .setImage('https://i.imgur.com/y4Iy9qd.jpg')
    .setFooter({ text: '如要開始遊玩，請先註冊帳號' });

const reg_btn = new MessageButton()
    .setEmoji('🧾')
    .setLabel('註冊帳號')
    .setCustomId('create-main-bounty-account')
    .setStyle('PRIMARY');

const start_btn = new MessageButton()
    .setEmoji('🕹️')
    .setLabel('開始遊玩')
    .setCustomId('start-bounty')
    .setStyle('SUCCESS');

const data_btn = new MessageButton()
    .setEmoji('📑')
    .setLabel('查看帳號數據')
    .setCustomId('check-account-data')
    .setStyle('PRIMARY');

const acc_btn = new MessageButton()
    .setEmoji('📜')
    .setLabel('查看遊玩紀錄')
    .setCustomId('check-personal-record')
    .setStyle('PRIMARY');

const play_info_btn = new MessageButton()
    .setEmoji('🤔')
    .setLabel('遊玩方式')
    .setStyle('LINK')
    .setURL('https://hackmd.io/@Quantami/lvl-sys-intro');

export const makeBountyBannerEmbed = () => {
    const curr_time = utcToZonedTime(Date.now(), 'Asia/Taipei');

    // const start_of_week_time = addHours(startOfWeek(curr_time), 7);
    const end_of_week_time = addHours(endOfWeek(curr_time), -2);

    // const weekly_start_timestamp = core.discord.getRelativeTimestamp(start_of_week_event.getTime());
    // const weekly_end_timestamp = core.discord.getRelativeTimestamp(end_of_week_event.getTime());

    const stamina_refresh_time = addMinutes(end_of_week_time, 30);
    const stamina_refresh_timestamp = core.discord.getRelativeTimestamp(stamina_refresh_time.getTime());

    const qns_thread_refresh_time = addHours(endOfMonth(curr_time), 6);
    const qns_thread_refresh_timestamp = core.discord.getRelativeTimestamp(qns_thread_refresh_time.getTime());

    const new_embed = new MessageEmbed(bounty_embed)
        .addField('問題串刷新時間', qns_thread_refresh_timestamp, true)
        .addField('體力更新時間', stamina_refresh_timestamp, true);
        // .addField('此輪開始時間', weekly_start_timestamp, false)
        // .addField('此輪結束時間', weekly_end_timestamp, false);

    return new_embed;
}

export const makeBountyBannerButtons = () => {
    return core.discord.compAdder([
        [reg_btn, play_info_btn, start_btn],
        [data_btn, acc_btn]
    ]);
}

export class BountyUIManager extends core.BaseManager {
    public f_platform: BountyPlatform;
    
    constructor(f_platform: BountyPlatform) {
        super();
        this.f_platform = f_platform;

        this.setupListener();
    }

    private setupListener() {
        this.f_platform.f_bot.on('messageCreate', async (msg) => {
            if (msg.author.id !== '610327503671656449') return;
            await this.messageHandler(msg);
        });
    }

    private async messageHandler(msg: Message) {
        switch (msg.content) {
            case 'send-bounty-banner': {
                await msg.channel.send({
                    embeds: [makeBountyBannerEmbed()],
                    components: makeBountyBannerButtons()
                });
            }
        }
    }
}
