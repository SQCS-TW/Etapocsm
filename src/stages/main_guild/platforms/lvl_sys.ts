import { core } from '../sc';
import * as lvl_sys_managers from '../managers/lvl_sys/reglist';

class LvlSysPlatform extends core.BasePlatform {
    constructor(father_stage: core.BaseStage) {
        super(father_stage);
    }

    async addManagers(this_platform: core.BasePlatform) {
        this.managers = [
            new lvl_sys_managers.ChatListener(this_platform)
        ]
    }
}

export {
    LvlSysPlatform
};
