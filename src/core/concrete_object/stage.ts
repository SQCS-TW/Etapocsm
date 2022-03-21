import { Etapocsm } from '../../../main';
import { Guild, Interaction, Message } from 'discord.js';
import { BasePlatform } from './platform';


class BaseStage {
    public bot: Etapocsm;
    public guild: Guild;

    protected child_platforms: Array<BasePlatform>;

    constructor(bot: Etapocsm, guild_id: string) {
        this.bot = bot;
        this.guild = bot.guilds.cache.get(guild_id);

        this.registerEventListener();
    }

    private checkObjectGuildID(obj: Interaction | Message) {
        if (obj.guildId !== this.guild.id) return false;
        return true;
    }

    private registerEventListener() {
        this.bot.on('interactionCreate', async (interaction: Interaction) => {
            if (!this.checkObjectGuildID(interaction)) return;
            await this.handleInteraction(interaction);
        });

        this.bot.on('messageCreate', async (msg: Message) => {
            if (!this.checkObjectGuildID(msg)) return;
            await this.handleMessage(msg);
        });
    }

    public async handleInteraction(interaction: Interaction) {
        this.child_platforms.forEach(async (platform) => {
            if (interaction.isCommand()) {
                await platform.transferSlcmd(interaction);
            } else if (interaction.isButton()) {
                await platform.transferButton(interaction);
            } else if (interaction.isSelectMenu()) {
                await platform.transferDropdown(interaction);
            }
        });
    }

    public async handleMessage(msg: Message) {
        this.child_platforms.forEach(async (platform) => {
            await platform.transferMessage(msg);
        });
    }

    protected async invokePlatforms(child_platforms: Array<BasePlatform>) {
        child_platforms.forEach(async (platform: any) => {
            await platform.addManagers(platform);
        });
        return child_platforms;
    }
}


export {
    BaseStage
};
