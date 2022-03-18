require('dotenv').config();

import fs from 'fs';

import {
    Client,
    Intents,
    ClientOptions,
    Interaction,
    CommandInteraction,
    SelectMenuInteraction,
    ButtonInteraction
} from 'discord.js';

import { MainGuildConfig, WorkingGuildConfig } from './core/cog_config';

type InteractionManager = {
    slCmdHandler?: (interaction: CommandInteraction) => Promise<void>,
    buttonHandler?: (interaction: ButtonInteraction) => Promise<void>,
    dropdownHandler?: (interaction: SelectMenuInteraction) => Promise<void>
};

type AllocaterSettingsInterface  = {
    interaction: Interaction,
    interaction_managers: Array<InteractionManager>
};

class Etapocsm extends Client {
    constructor(options: ClientOptions) {
        super(options);
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
}

const bot = new Etapocsm({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES
    ]
});

bot.on('ready', async () => {
    console.log(`${bot.user.username} has logged in!`);

    // await resetSlCmd(bot);
    // console.log('Cogs reseted!');

    // directly transforming recursive func: "recurLoadCogs" into async func 
    // will cause weird problems
    await new Promise(resolve => {
        recurLoadCogs('./src/cogs/');
        resolve('ok!');
    });
    console.log('Cogs loaded!');
});

function recurLoadCogs(dir: string): void {
    // load "cogs" files with func: "promoter" under ./cogs/
    fs.readdir(dir, (err, files) => {
        files.forEach(file => {
            if (file.endsWith('.ts')) {
                const { promoter } = require(`./${dir.substring(6)}${file}`);
                if (promoter) promoter(bot);
            } else if (file.indexOf('.') === -1) {
                recurLoadCogs(`${dir}${file}/`);
            }
        });
    });
}

async function resetSlCmd(bot: Client): Promise<void> {
    // clear registered slash commands in every guild
    await (new MainGuildConfig(bot)).slCmdReset();
    //await (new WorkingGuildConfig(bot)).slCmdReset();
}

bot.login(process.env.BOT_TOKEN);

export {
    bot,
    Etapocsm
};
