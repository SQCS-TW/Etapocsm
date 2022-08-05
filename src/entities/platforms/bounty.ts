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

    BountyUIManager,

    AutoManager
} from '../managers/bounty/reglist';

export class BountyPlatform extends core.BasePlatform {
    // operators for child managers
    public readonly account_op = new core.BountyUserAccountOperator();
    public readonly ongoing_op = new core.BountyUserOngoingInfoOperator();
    public readonly qns_op = new core.BountyQnsDBOperator();
    public readonly mainlvl_acc_op = new core.MainLevelAccountOperator();

    public readonly start_button_op = new core.BaseMongoOperator({
        db: 'Bounty',
        coll: 'StartButtonPipeline'
    });
    public readonly db_cache_operator = new core.BaseMongoOperator({
        db: 'Bounty',
        coll: 'StorjQnsDBCache'
    });

    // for resetting user data
    public readonly confirm_start_button_op = new core.BaseMongoOperator({
        db: 'Bounty',
        coll: 'StartButtonPipeline'
    });
    public readonly end_button_op = new core.BaseMongoOperator({
        db: 'Bounty',
        coll: 'EndButtonPipeline'
    });
    public readonly dropdown_op = new core.BaseMongoOperator({
        db: 'Bounty',
        coll: 'DropdownPipeline'
    });
    //

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

            new BountyUIManager(this),

            new AutoManager(this)
        ];
    }
}
