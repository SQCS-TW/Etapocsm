import { Client, ClientOptions } from 'discord.js';
import { BasePlatform } from './core/reglist';
import { LvlSysPlatform } from './entities/platforms/reglist';


class Etapocsm extends Client {
    private platforms: Array<BasePlatform>;

    constructor(options: ClientOptions) {
        super(options);
        this.setupListener();
    }

    private setupListener() {
        this.on('ready', async () => {
            console.log(`${this.user.username} has logged in!`);

            // activate = add + invoke
            await this.activatePlatforms(this);
        });
    }

    public async activatePlatforms(this_bot: Etapocsm) {
        await this.addPlatforms(this_bot);
        await this.invokePlatforms();
    }

    private async addPlatforms(this_bot: Etapocsm) {
        this.platforms = [
            new LvlSysPlatform(this_bot)
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
}

export {
    Etapocsm
};
