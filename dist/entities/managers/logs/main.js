"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogsManager = void 0;
const discord_js_1 = require("discord.js");
const shortcut_1 = require("../../shortcut");
const fs_1 = __importDefault(require("fs"));
class LogsManager extends shortcut_1.core.BaseManager {
    constructor(f_platform) {
        super(f_platform);
        this.log_channel = undefined;
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
            this.log_channel = await (await this.f_platform.f_bot.guilds.fetch(shortcut_1.core.GuildId.CADRE)).channels.fetch('992264680158548039');
        }
        const file_names = fs_1.default.readdirSync('./logs/');
        await shortcut_1.core.asyncForEach(file_names, async (file_name) => {
            if (this.log_channel instanceof discord_js_1.TextChannel)
                await this.log_channel.send({
                    content: shortcut_1.core.localizeDatetime(),
                    files: [`./logs/${file_name}`]
                });
            fs_1.default.writeFileSync(`./logs/${file_name}`, '');
            await shortcut_1.core.sleep(2);
        });
        return self_routine();
    }
}
exports.LogsManager = LogsManager;
