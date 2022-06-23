import { Message, MessageButton, MessageEmbed } from 'discord.js';
import { core } from '../../shortcut';
import { endOfWeek, startOfWeek } from 'date-fns';


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
                const relativeDiscordTimestamp = (t) => { return `<t:${Math.trunc(t / 1000)}:R>`; };

                const start = relativeDiscordTimestamp(startOfWeek(Date.now()));
                const end = relativeDiscordTimestamp(endOfWeek(Date.now()));

                const test_embed = new MessageEmbed()
                    .setTitle('懸賞區選單')
                    .addField('此輪開始時間', start, true)
                    .addField('此輪結束時間', end, true)
                    .setColor('#ffffff')
                    .setImage('https://i.imgur.com/iAEU0wz.png')
                    .setFooter({ text: '如要開始遊玩，請先註冊帳號' });

                const reg_btn = new MessageButton()
                    .setLabel('註冊帳號')
                    .setCustomId('create-main-bounty-account')
                    .setStyle('PRIMARY');

                const start_btn = new MessageButton()
                    .setLabel('開始遊玩')
                    .setCustomId('start-bounty')
                    .setStyle('SUCCESS');

                const data_btn = new MessageButton()
                    .setLabel('查看帳號數據')
                    .setCustomId('check-main-bounty-account')
                    .setStyle('PRIMARY');

                const acc_btn = new MessageButton()
                    .setLabel('查看遊玩紀錄')
                    .setCustomId('check-bounty-ongoing-info')
                    .setStyle('PRIMARY');

                const play_info_btn = new MessageButton()
                    .setLabel('遊玩方式')
                    .setStyle('LINK')
                    .setURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ');

                await msg.reply({
                    embeds: [test_embed],
                    components: core.discord.compAdder([
                        [reg_btn, play_info_btn, start_btn],
                        [data_btn, acc_btn]
                    ])
                });
            }
        }
    }
}