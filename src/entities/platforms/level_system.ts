import { core } from '../shortcut';
import { Etapocsm } from '../../bot';

import {
    StaticDataSetter,
    AutoUpdateAccountManager,
    UserInteractionHandler
} from '../managers/level_system/reglist';

export class LvlSysPlatform extends core.BasePlatform {
    constructor(f_bot: Etapocsm) {
        super(f_bot);

        this.managers = [
            new StaticDataSetter(this),
            new AutoUpdateAccountManager(this),
            new UserInteractionHandler(this)
        ]
    }
}
