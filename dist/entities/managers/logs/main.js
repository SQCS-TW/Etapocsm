"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogsManager = void 0;
const discord_js_1 = require("discord.js");
const shortcut_1 = require("../../shortcut");
const fs_1 = require("fs");
class LogsManager extends shortcut_1.core.BaseManager {
    constructor(f_platform) {
        super();
        this.log_channel = undefined;
        this.f_platform = f_platform;
        this.setupListener();
    }
    setupListener() {
        this.f_platform.f_bot.on('ready', async () => {
            await this.sendLogs();
        });
    }
    async sendLogs() {
        const self_routine = () => setTimeout(async () => { await this.sendLogs(); }, 1 * 60 * 1000);
        if (!this.log_channel) {
            this.log_channel = await (await this.f_platform.f_bot.guilds.fetch(shortcut_1.core.GuildId.CADRE)).channels.fetch('992278772986429441');
        }
        const file_names = (0, fs_1.readdirSync)('./logs/');
        await shortcut_1.core.asyncForEach(file_names, async (file_name) => {
            const data = (0, fs_1.readFileSync)(`./logs/${file_name}`, {
                encoding: 'utf-8'
            });
            if (data.split('\n').length < 100)
                return;
            if (this.log_channel instanceof discord_js_1.TextChannel)
                await this.log_channel.send({
                    content: shortcut_1.core.localizeDatetime(),
                    files: [`./logs/${file_name}`]
                });
            (0, fs_1.writeFileSync)(`./logs/${file_name}`, '');
            await shortcut_1.core.sleep(2);
        });
        return self_routine();
    }
}
exports.LogsManager = LogsManager;
