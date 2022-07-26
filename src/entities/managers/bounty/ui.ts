import { Message, MessageButton, MessageEmbed } from 'discord.js';
import { core } from '../../shortcut';
import { endOfWeek, startOfWeek } from 'date-fns';

import { utcToZonedTime } from 'date-fns-tz';

const bounty_embed = new MessageEmbed()
    .setTitle('懸賞區選單')
    .setColor('#ffffff')
    .setImage('https://i.imgur.com/iAEU0wz.png')
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
    const start = core.discord.getRelativeTimestamp(startOfWeek(curr_time).getTime() + 7 * 60 * 60 * 1000);
    const end = core.discord.getRelativeTimestamp(endOfWeek(curr_time).getTime() - 2 * 60 * 60 * 1000);
    
    const new_embed = new MessageEmbed(bounty_embed)
        .addField('此輪開始時間', start, true)
        .addField('此輪結束時間', end, true);

    return new_embed;
}

export const makeBountyBannerButtons = () => {
    return core.discord.compAdder([
        [reg_btn, play_info_btn, start_btn],
        [data_btn, acc_btn]
    ]);
}

export class BountyUIManager extends core.BaseManager {

    constructor(f_platform: core.BasePlatform) {
        super(f_platform);

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
