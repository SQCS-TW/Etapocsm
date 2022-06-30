import { Client, ClientOptions } from 'discord.js';
import { BasePlatform } from './core/reglist';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { core } from './entities/shortcut';

import {
    ChatExpPlatform,
    BountyPlatform,
    LvlSysPlatform
} from './entities/platforms/reglist';

import { logger } from './logger';

export class Etapocsm extends Client {
    private platforms: Array<BasePlatform>;
    public logger = logger;

    constructor(options: ClientOptions) {
        super(options);

        this.platforms = [
            new ChatExpPlatform(this),
            new BountyPlatform(this),
            new LvlSysPlatform(this)
        ];

        this.setupListener();
    }

    private setupListener() {
        this.on('ready', async () => {
            if (!this.user) throw new Error('Client is null.');

            console.log(`${this.user.username} has logged in!`);

            // await this.registerSlcmd();
        });
    }

    public async registerSlcmd() {
        const slcmd_register_list = [];

        await core.asyncForEach(this.platforms, async (pf: any) => {
            await core.asyncForEach(pf.managers, async (mng: any) => {
                if (!mng.SLCMD_REGISTER_LIST) return;

                await core.asyncForEach(mng.SLCMD_REGISTER_LIST, async (slcmd) => {
                    slcmd_register_list.push(slcmd);
                });
            });
        });

        const BOT_TOKEN = process.env.BOT_TOKEN;
        const BOT_ID = process.env.BOT_ID;
        const MAIN_GUILD_ID = process.env.SQCS_MAIN_GUILD_ID;

        const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);

        await rest.put(Routes.applicationGuildCommands(BOT_ID, MAIN_GUILD_ID), { body: [] }) // reset slcmd
        if (slcmd_register_list.length !== 0) {
            await rest.put(Routes.applicationGuildCommands(BOT_ID, MAIN_GUILD_ID), { body: slcmd_register_list })
            console.log('slcmd registered!');
        }
    }
}
