import { Client, ClientOptions } from 'discord.js';
import { BaseStage } from './core/reglist';
import { main_guild } from './main_stages/reglist';

class Etapocsm extends Client {
    private child_stages: Array<BaseStage>;

    constructor(options: ClientOptions) {
        super(options);
        this.setupListener();
    }

    private setupListener() {
        this.on('ready', async () => {
            console.log(`${this.user.username} has logged in!`);

            await this.addChildStages(this);
        });
    }

    public async addChildStages(bot: Etapocsm) {
        this.child_stages = [
            new main_guild.MainGuildStage(bot)
        ]

        this.child_stages.forEach(async (stage: any) => {
            await stage.addPlatforms(stage);
        });
    }
}

export {
    Etapocsm
};
