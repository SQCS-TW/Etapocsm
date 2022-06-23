import { Message, MessageButton, MessageEmbed } from 'discord.js';
import { core } from '../../shortcut';
import { endOfWeek, startOfWeek } from 'date-fns';


export class BountyUIManager extends core.BaseManager {
    private bounty_embed = new MessageEmbed()
        .setTitle('懸賞區選單')
        .setColor('#ffffff')
        .setImage('https://i.imgur.com/iAEU0wz.png')
        .setFooter({ text: '如要開始遊玩，請先註冊帳號' });

    private reg_btn = new MessageButton()
        .setLabel('註冊帳號')
        .setCustomId('create-main-bounty-account')
        .setStyle('PRIMARY');

    private start_btn = new MessageButton()
        .setLabel('開始遊玩')
        .setCustomId('start-bounty')
        .setStyle('SUCCESS');

    private data_btn = new MessageButton()
        .setLabel('查看帳號數據')
        .setCustomId('check-account-data')
        .setStyle('PRIMARY');

    private acc_btn = new MessageButton()
        .setLabel('查看遊玩紀錄')
        .setCustomId('check-personal-record')
        .setStyle('PRIMARY');

    private play_info_btn = new MessageButton()
        .setLabel('遊玩方式')
        .setStyle('LINK')
        .setURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ');

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

                const new_embed = new MessageEmbed(this.bounty_embed)
                    .addField('此輪開始時間', start, true)
                    .addField('此輪結束時間', end, true);

                await msg.channel.send({
                    embeds: [new_embed],
                    components: core.discord.compAdder([
                        [this.reg_btn, this.play_info_btn, this.start_btn],
                        [this.data_btn, this.acc_btn]
                    ])
                });
            }
        }
    }
}
