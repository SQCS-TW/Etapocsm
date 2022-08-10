"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogsManager = void 0;
const discord_js_1 = require("discord.js");
const shortcut_1 = require("../../shortcut");
const fs_1 = require("fs");
const winston_1 = require("winston");
const { combine, label, printf } = winston_1.format;
const myFormat = printf(({ level, label, message }) => {
    return `${shortcut_1.core.localizeDatetime()} [${label}] ${level}: ${message}`;
});
const command_logger = (0, winston_1.createLogger)({
    level: 'info',
    format: combine(label({ label: 'INTERACTION' }), myFormat),
    transports: [
        new winston_1.transports.Console(),
        new winston_1.transports.File({ filename: './logs/commands.log' })
    ]
});
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
        this.f_platform.f_bot.on('interactionCreate', async (interaction) => {
            if (!interaction.isCommand())
                return;
            command_logger.info(`User ${interaction.user.username}(${interaction.user.id}) in guild \`${interaction.guild.name}(${interaction.guild.id})\`\n` +
                `Provoked slcmd \`${interaction.commandName}\`, args | ${await this.fetchSlcmdArgs(interaction)}\n`);
        });
        this.f_platform.f_bot.on('messageCreate', async (msg) => {
            if (!msg.content.startsWith('e:'))
                return;
            command_logger.info(`User ${msg.author.username}(${msg.author.id}) in guild \`${msg.guild.name}(${msg.guild.id})\`\n` +
                `Provoked admin-cmd \`${msg.content}\`\n`);
        });
    }
    async fetchSlcmdArgs(interaction) {
        const args = [];
        await shortcut_1.core.asyncForEach(interaction.options?.data, async (arg_data) => {
            args.push(`${arg_data.name}: ${arg_data.value}`);
        });
        if (args.length === 0)
            return 'none';
        else
            return args.join(', ');
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
