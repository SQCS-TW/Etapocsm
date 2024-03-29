import { Client, ClientOptions } from 'discord.js';
import { BasePlatform, normal_logger } from './core/reglist';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { core } from './entities/shortcut';

import {
    ChatExpPlatform,
    BountyPlatform,
    LvlSysPlatform,
    AdministratorPlatform,
    LogsPlatform,
    AMAPlatform
} from './entities/platforms/reglist';

export class Etapocsm extends Client {
    private platforms: Array<BasePlatform>;

    private readonly BOT_TOKEN = process.env.BOT_TOKEN;
    private readonly BOT_ID = process.env.BOT_ID;

    constructor(options: ClientOptions) {
        super(options);

        this.platforms = [
            new ChatExpPlatform(this),
            new BountyPlatform(this),
            new LvlSysPlatform(this),
            new AdministratorPlatform(this),
            new LogsPlatform(this),
            new AMAPlatform(this)
        ];

        this.setupListener();
    }

    private setupListener() {
        this.on('ready', async () => {
            if (!this.user) throw new Error('Client is null.');
            normal_logger.info(`${this.user.username} has logged in!`);
        });
    }

    public async registerSlcmd(guild_id: string) {
        const slcmd_register_list = await this.findSlcmdOfCertainGuild(guild_id);
        const rest = new REST({ version: '9' }).setToken(this.BOT_TOKEN);

        await rest.put(Routes.applicationGuildCommands(this.BOT_ID, guild_id), { body: [] }) // reset slcmd
        if (slcmd_register_list.length !== 0) {
            await rest.put(Routes.applicationGuildCommands(this.BOT_ID, guild_id), { body: slcmd_register_list })
            normal_logger.info(`Slcmd of guild ${guild_id} registered!`);
        }
    }

    private async findSlcmdOfCertainGuild(guild_id: string) {
        const slcmd_register_list = [];

        await core.asyncForEach(this.platforms, async (pf: any) => {
            await core.asyncForEach(pf.managers, async (mng: any) => {
                const reg_options: core.SlcmdRegisterOptions | undefined = mng?.slcmd_register_options;
                if (!reg_options) return;
                if (!reg_options.guild_id.includes(guild_id)) return;

                await core.asyncForEach(reg_options.cmd_list, async (slcmd) => {
                    slcmd_register_list.push(slcmd);
                });
            });
        });

        return slcmd_register_list;
    }
}
