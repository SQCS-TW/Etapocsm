import fs from 'fs';

import {
    Client,
    ClientOptions,
    Interaction,
    CommandInteraction,
    SelectMenuInteraction,
    ButtonInteraction,
    Collection
} from 'discord.js';

import { MainGuildConfig, WorkingGuildConfig } from './core/cog_config';

type InteractionManager = {
    slCmdHandler?: (interaction: CommandInteraction) => Promise<void>,
    buttonHandler?: (interaction: ButtonInteraction) => Promise<void>,
    dropdownHandler?: (interaction: SelectMenuInteraction) => Promise<void>
};

type AllocaterSettingsInterface = {
    interaction: Interaction,
    interaction_managers: Array<InteractionManager>
};


class Etapocsm extends Client {
    public cogs_list: Collection<string, string>;

    constructor(options: ClientOptions) {
        super(options);
        this.setupListener();
        this.cogs_list = new Collection();
    }

    setupListener() {
        this.on('ready', async () => {
            console.log(`${this.user.username} has logged in!`);

            //await this.resetSlCmd(bot);
            // console.log('Cogs reseted!');

            await this.recurLoadCogs('./src/cogs/');
            console.log('Cogs loaded!');
        });
    }

    async interactionAllocater(allocater_settings: AllocaterSettingsInterface) {
        const {
            interaction,
            interaction_managers
        } = allocater_settings;

        interaction_managers.forEach(async (manager) => {
            if (interaction.isCommand() && manager.slCmdHandler) {
                await manager.slCmdHandler(interaction);
            } else if (interaction.isButton() && manager.buttonHandler) {
                await manager.buttonHandler(interaction);
            } else if (interaction.isSelectMenu() && manager.dropdownHandler) {
                await manager.dropdownHandler(interaction);
            }
        });
    }

    async loadSingleCog(dir: string): Promise<boolean> {
        try {
            const { promoter } = require(dir);
            if (promoter) {
                const cog_name = await promoter(this);
                this.cogs_list.set(cog_name, dir);
            }

            return true;
        } catch(err) {
            return false;
        }
    }

    async recurLoadCogs(dir: string): Promise<void> {
        // load "cogs" files with func: "promoter" under ./cogs/
        fs.readdir(dir, async (err, files) => {
            files.forEach(async (file) => {
                if (file.endsWith('.ts')) {
                    const file_path = `./${dir.substring(6)}${file}`
                    await this.loadSingleCog(file_path);
                } else if (file.indexOf('.') === -1) {
                    await this.recurLoadCogs(`${dir}${file}/`);
                }
            });
        });
    }

    async reloadCog(cog_name: string): Promise<boolean> {
        try {
            const cog_path = this.cogs_list.get(cog_name);
            console.log('cog_path', cog_path);
            console.log('cog_name', cog_name);

            delete require.cache[require.resolve(cog_path)];
            
            const load_result = await this.loadSingleCog(cog_path);
            console.log(require.cache[require.resolve(cog_path)]);
            return load_result;
        } catch(err) {
            return false;
        }
    }

    async resetSlCmd(bot: Etapocsm): Promise<void> {
        // clear registered slash commands in every guild
        await (new MainGuildConfig(bot)).slCmdReset();
        //await (new WorkingGuildConfig(bot)).slCmdReset();
    }
}

export {
    Etapocsm
};
