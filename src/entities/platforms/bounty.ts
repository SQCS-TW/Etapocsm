import { core } from '../shortcut';
import { Etapocsm } from '../../bot';
import { BountyQnsDBManager } from '../managers/bounty/reglist';

class BountyPlatform extends core.BasePlatform {
    constructor(f_bot: Etapocsm) {
        super(f_bot);
    }

    public async activateManagers(this_platform: core.BasePlatform) {
        await this.addManagers(this_platform);
    }

    public async addManagers(this_platform: core.BasePlatform) {
        this.managers = [
            new BountyQnsDBManager(this_platform)
        ]
    }
}

export {
    BountyPlatform
};
