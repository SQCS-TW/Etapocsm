import { core } from '../shortcut';
import { Etapocsm } from '../../bot';

import {
    BountyQnsDBManager,

    BountyAccountManager,
    StartBountyManager,
    ConfirmStartBountyManager,
    EndBountyManager,
    SelectBountyAnswerManager,
    EndBountySessionManager,

    BountyUserManiManager,

    BountyUIManager
} from '../managers/bounty/reglist';

export class BountyPlatform extends core.BasePlatform {
    constructor(f_bot: Etapocsm) {
        super(f_bot);

        this.managers = [
            new BountyQnsDBManager(this),

            new BountyAccountManager(this),
            new StartBountyManager(this),
            new ConfirmStartBountyManager(this),
            new EndBountyManager(this),
            new SelectBountyAnswerManager(this),
            new EndBountySessionManager(this),

            new BountyUserManiManager(this),

            new BountyUIManager(this)
        ];
    }
}
