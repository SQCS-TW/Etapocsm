import { Channel, MessageAttachment, TextChannel } from 'discord.js';
import { core } from '../../shortcut';
import fs from 'fs';


export class LogsManager extends core.BaseManager {
    private log_channel: Channel = undefined;
    constructor(f_platform: core.BasePlatform) {
        super(f_platform);

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
            this.log_channel = await (await this.f_platform.f_bot.guilds.fetch(core.GuildId.CADRE)).channels.fetch('992264680158548039');
        }

        const file_names = fs.readdirSync('./logs/');
        await core.asyncForEach(file_names, async (file_name: string) => {
            if (this.log_channel instanceof TextChannel) await this.log_channel.send({
                content: core.localizeDatetime(),
                files: [`./logs/${file_name}`]
            });
            fs.writeFileSync(`./logs/${file_name}`, '');
            await core.sleep(2);
        });

        return self_routine();
    }
}