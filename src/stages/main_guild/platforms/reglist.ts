import { core } from '../sc';
import * as bounty from './bounty/reglist';

class BountyPlatforms extends core.BasePlatform {
    constructor(father_stage: core.BaseStage) {
        super(father_stage);
    }

    async addManagers(this_platform: core.BasePlatform) {
        this.managers = [
            new bounty.BountyAutoTaskManager(this_platform),
            new bounty.BountyQnsDBManager(this_platform),
            new bounty.BountyMainManager(this_platform)
        ]
    }
}

export {
    BountyPlatforms
}