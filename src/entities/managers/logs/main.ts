import { Channel, TextChannel } from 'discord.js';
import { core } from '../../shortcut';
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { LogsPlatform } from '../../platforms/logs';


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
