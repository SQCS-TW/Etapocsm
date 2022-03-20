import { BaseStage } from '../core/reglist';
import { Etapocsm } from '../../main';
import { platforms } from './main_guild/reglist';


class MainGuildStage extends BaseStage {
    constructor(bot: Etapocsm) {
        const main_guild_id = '743507979369709639';
        super(bot, main_guild_id);
    }

    public async addPlatforms(this_stage: BaseStage) {
        this.child_platforms = [
            new platforms.BountyPlatforms(this_stage)
        ];

        this.child_platforms.forEach(async (platform: any) => {
            await platform.addManagers(platform);
        });
    }
}

export {
    MainGuildStage
};
