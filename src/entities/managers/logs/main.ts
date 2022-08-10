import { Channel, CommandInteraction, TextChannel, CommandInteractionOption } from 'discord.js';
import { core } from '../../shortcut';
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { LogsPlatform } from '../../platforms/logs';

import { createLogger, format, transports } from 'winston';
const { combine, label, printf } = format;


const myFormat = printf(({ level, label, message }) => {
    return `${core.localizeDatetime()} [${label}] ${level}: ${message}`;
});

const command_logger = createLogger({
    level: 'info',
    format: combine(
        label({ label: 'INTERACTION' }),
        myFormat
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: './logs/commands.log'})
    ]
});


export class LogsManager extends core.BaseManager {
    public f_platform: LogsPlatform;

    private log_channel: Channel = undefined;

    constructor(f_platform: LogsPlatform) {
        super();
        this.f_platform = f_platform;

        this.setupListener();
    }

    private setupListener() {
        this.f_platform.f_bot.on('ready', async () => {
            await this.sendLogs();
        });

        this.f_platform.f_bot.on('interactionCreate', async (interaction) => {
            if (!interaction.isCommand()) return;

            command_logger.info(
                `User ${interaction.user.username}(${interaction.user.id}) in guild \`${interaction.guild.name}(${interaction.guild.id})\`\n` +
                `Provoked slcmd \`${interaction.commandName}\`, args | ${await this.fetchSlcmdArgs(interaction)}\n`
            );
        });

        this.f_platform.f_bot.on('messageCreate', async (msg) => {
            if (!msg.content.startsWith('e:')) return;

            command_logger.info(
                `User ${msg.author.username}(${msg.author.id}) in guild \`${msg.guild.name}(${msg.guild.id})\`\n` +
                `Provoked admin-cmd \`${msg.content}\`\n`
            );
        });
    }

    private async fetchSlcmdArgs(interaction: CommandInteraction) {
        const args = [];
        await core.asyncForEach(interaction.options?.data, async (arg_data: CommandInteractionOption) => {
            args.push(`${arg_data.name}: ${arg_data.value}`);
        });
        if (args.length === 0) return 'none';
        else return args.join(', ');
    }

    private async sendLogs() {
        const self_routine = () => setTimeout(async () => { await this.sendLogs() }, 1 * 60 * 1000);

        if (!this.log_channel) {
            this.log_channel = await (await this.f_platform.f_bot.guilds.fetch(core.GuildId.CADRE)).channels.fetch('992278772986429441');
        }

        const file_names = readdirSync('./logs/');
        await core.asyncForEach(file_names, async (file_name: string) => {

            const data = readFileSync(`./logs/${file_name}`, {
                encoding: 'utf-8'
            });
            if (data.split('\n').length < 100) return;

            if (this.log_channel instanceof TextChannel) await this.log_channel.send({
                content: core.localizeDatetime(),
                files: [`./logs/${file_name}`]
            });
            writeFileSync(`./logs/${file_name}`, '');
            await core.sleep(2);
        });

        return self_routine();
    }
}
