import { Client, ClientOptions } from 'discord.js';
import { BaseStage } from './core/reglist';
import { MainGuildStage } from './stages/reglist';


class Etapocsm extends Client {
    private child_stages: Array<BaseStage>;

    constructor(options: ClientOptions) {
        super(options);
        this.setupListener();
    }

    private setupListener() {
        this.on('ready', async () => {
            console.log(`${this.user.username} has logged in!`);

            await this.addStages(this);
        });
    }

    public async addStages(bot: Etapocsm) {
        this.child_stages = await this.invokeStages([
            new MainGuildStage(bot)
        ]);
    }

    private async invokeStages(child_stages: Array<BaseStage>) {
        child_stages.forEach(async (stage: any) => {
            await stage.addPlatforms(stage);
        });
        return child_stages;
    }
}

export {
    Etapocsm
};
