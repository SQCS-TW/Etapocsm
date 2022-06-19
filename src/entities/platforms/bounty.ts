import { core } from '../shortcut';
import { Etapocsm } from '../../bot';

import {
    BountyQnsDBManager,
    BountyAccountManager,
    BountyEventManager,
    BountyEventAutoManager,
    BountyUserManiManager
} from '../managers/bounty/reglist';

export class BountyPlatform extends core.BasePlatform {
    constructor(f_bot: Etapocsm) {
        super(f_bot);

        this.managers = [
            new BountyQnsDBManager(this),
            new BountyAccountManager(this),
            new BountyEventManager(this),
            new BountyEventAutoManager(this),
            new BountyUserManiManager(this)
        ]
    }
}
