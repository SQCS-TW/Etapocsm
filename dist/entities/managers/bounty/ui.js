"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BountyUIManager = void 0;
const discord_js_1 = require("discord.js");
const shortcut_1 = require("../../shortcut");
const date_fns_1 = require("date-fns");
class BountyUIManager extends shortcut_1.core.BaseManager {
    constructor(f_platform) {
        super(f_platform);
        this.bounty_embed = new discord_js_1.MessageEmbed()
            .setTitle('懸賞區選單')
            .setColor('#ffffff')
            .setImage('https://i.imgur.com/iAEU0wz.png')
            .setFooter({ text: '如要開始遊玩，請先註冊帳號' });
        this.reg_btn = new discord_js_1.MessageButton()
            .setLabel('註冊帳號')
            .setCustomId('create-main-bounty-account')
            .setStyle('PRIMARY');
        this.start_btn = new discord_js_1.MessageButton()
            .setLabel('開始遊玩')
            .setCustomId('start-bounty')
            .setStyle('SUCCESS');
        this.data_btn = new discord_js_1.MessageButton()
            .setLabel('查看帳號數據')
            .setCustomId('check-account-data')
            .setStyle('PRIMARY');
        this.acc_btn = new discord_js_1.MessageButton()
            .setLabel('查看遊玩紀錄')
            .setCustomId('check-personal-record')
            .setStyle('PRIMARY');
        this.play_info_btn = new discord_js_1.MessageButton()
            .setLabel('遊玩方式')
            .setStyle('LINK')
            .setURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
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
                const relativeDiscordTimestamp = (t) => { return `<t:${Math.trunc(t / 1000)}:R>`; };
                const start = relativeDiscordTimestamp((0, date_fns_1.startOfWeek)(Date.now()));
                const end = relativeDiscordTimestamp((0, date_fns_1.endOfWeek)(Date.now()));
                const new_embed = new discord_js_1.MessageEmbed(this.bounty_embed)
                    .addField('此輪開始時間', start, true)
                    .addField('此輪結束時間', end, true);
                await msg.channel.send({
                    embeds: [new_embed],
                    components: shortcut_1.core.discord.compAdder([
                        [this.reg_btn, this.play_info_btn, this.start_btn],
                        [this.data_btn, this.acc_btn]
                    ])
                });
            }
        }
    }
}
exports.BountyUIManager = BountyUIManager;
