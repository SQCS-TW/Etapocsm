import { Client, ClientOptions } from 'discord.js';
import { BasePlatform } from './core/reglist';
import { LvlSysPlatform, BountyPlatform } from './entities/platforms/reglist';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { core } from './entities/shortcut';


export class Etapocsm extends Client {
    private platforms: Array<BasePlatform>;

    constructor(options: ClientOptions) {
        super(options);
        this.setupListener();
    }

    private setupListener() {
        this.on('ready', async () => {
            if (!this.user) throw new Error('Client is null.');

            console.log(`${this.user.username} has logged in!`);

            // activate = add + invoke
            await this.activatePlatforms(this);

            await this.registerSlcmd();
        });
    }

    public async activatePlatforms(this_bot: Etapocsm) {
        await this.addPlatforms(this_bot);
        await this.invokePlatforms();
    }

    private async addPlatforms(this_bot: Etapocsm) {
        this.platforms = [
            new LvlSysPlatform(this_bot),
            new BountyPlatform(this_bot)
        ]
    }

    private async invokePlatforms() {
        try {
            this.platforms.forEach(async (platform: any) => {
                await platform.activateManagers(platform);
            });
        } catch (err) {
            throw new Error(`Error when invoking plats.\n msg: ${err}`);
        }
    }

    private async registerSlcmd() {
        const slcmd_register_list = []

        this.platforms.forEach((pf: core.BasePlatform) => {
            pf.managers.forEach((mg: any) => {
                if (!mg.SLCMD_REGISTER_LIST) return;

                mg.SLCMD_REGISTER_LIST.forEach((slcmd: object) => {
                    slcmd_register_list.push(slcmd);
                })
            });
        });
        console.log(slcmd_register_list);
        const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

        if (slcmd_register_list.length !== 0) {
            await rest.put(Routes.applicationGuildCommands(process.env.BOT_ID, process.env.SQCS_MAIN_GUILD_ID), { body: slcmd_register_list })
            console.log('slcmd registered!');
        }
    }
}
