import { Etapocsm } from '../../../main';
import { Guild, Interaction } from 'discord.js';
import { BasePlatform } from './platform';


class BaseStage {
    public bot: Etapocsm;
    public guild: Guild;

    protected child_platforms_waitlist: Array<BasePlatform>;
    protected child_platforms: Array<BasePlatform>;

    constructor(bot: Etapocsm, guild_id: string) {
        this.bot = bot;
        this.guild = bot.guilds.cache.get(guild_id);

        this.registerInteractionListener();
    }

    private registerInteractionListener() {
        this.bot.on('interactionCreate', async (interaction: Interaction) => {
            if (interaction.guild.id !== this.guild.id) return;
            await this.handleInteraction(interaction);
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

    protected async invokePlatforms() {
        this.child_platforms.forEach(async (platform: any) => {
            await platform.addManagers(platform);
        });
    }
}


export {
    BaseStage
};
