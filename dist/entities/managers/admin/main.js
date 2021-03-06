"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdministratorManager = void 0;
const shortcut_1 = require("../../shortcut");
class AdministratorManager extends shortcut_1.core.BaseManager {
    constructor(f_platform) {
        super(f_platform);
        this.setupListener();
        this.slcmd_register_options = {
            guild_id: [shortcut_1.core.GuildId.MAIN, shortcut_1.core.GuildId.CADRE],
            cmd_list: [
                {
                    name: 'ping',
                    description: '戳一下機器人'
                }
            ]
        };
    }
    setupListener() {
        this.f_platform.f_bot.on('messageCreate', async (msg) => {
            if (msg.member?.permissions?.any('ADMINISTRATOR'))
                await this.messageHandler(msg);
        });
        this.f_platform.f_bot.on('interactionCreate', async (interaction) => {
            if (interaction.isCommand())
                await this.slcmdHandler(interaction);
        });
    }
    async messageHandler(msg) {
        switch (msg.content) {
            case 'e:REGISTER-SLASH-COMMAND': {
                await this.f_platform.f_bot.registerSlcmd(msg.guildId);
                await msg.reply(`slcmd of guild ${msg.guildId} registered!`);
            }
        }
    }
    async slcmdHandler(interaction) {
        switch (interaction.commandName) {
            case 'ping': {
                await interaction.deferReply();
                return await interaction.editReply(`🏓 Latency is ${Date.now() - interaction.createdTimestamp}ms.\n` +
                    `API Latency is ${Math.round(this.f_platform.f_bot.ws.ping)}ms.`);
            }
        }
    }
}
exports.AdministratorManager = AdministratorManager;
