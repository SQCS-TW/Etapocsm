import { core } from '../sc';
import * as bounty_managers from '../managers/bounty_pf/reglist';

class BountyPlatform extends core.BasePlatform {
    constructor(father_stage: core.BaseStage) {
        super(father_stage);
    }

    async addManagers(this_platform: core.BasePlatform) {
        this.managers = [
            new bounty_managers.BountyAutoTaskManager(this_platform),
            new bounty_managers.BountyQnsDBManager(this_platform),
            new bounty_managers.BountyMainManager(this_platform)
        ]
    }
}

export {
    BountyPlatform
};
