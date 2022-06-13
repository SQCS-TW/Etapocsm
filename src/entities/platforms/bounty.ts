import { core } from '../shortcut';
import { Etapocsm } from '../../bot';
import { BountyQnsDBManager, BountyAccountManager, BountyEventManager } from '../managers/bounty/reglist';

export class BountyPlatform extends core.BasePlatform {
    constructor(f_bot: Etapocsm) {
        super(f_bot);
    }

    public async activateManagers(this_platform: core.BasePlatform) {
        await this.addManagers(this_platform);
    }

    public async addManagers(this_platform: core.BasePlatform) {
        this.managers = [
            new BountyQnsDBManager(this_platform),
            new BountyAccountManager(this_platform),
            new BountyEventManager(this_platform)
        ]
    }
}
