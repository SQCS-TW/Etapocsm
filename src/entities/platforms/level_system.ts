import { core } from '../shortcut';
import { Etapocsm } from '../../bot';

import {
    StaticDataSetter,
    AutoUpdateAccountManager,
    UserInteractionsManager,
    UserManiManager
} from '../managers/level_system/reglist';

export class LvlSysPlatform extends core.BasePlatform {
    // operators for child managers
    public readonly mainlvl_acc_op = new core.MainLevelAccountOperator();
    public readonly bounty_acc_op = new core.BountyUserAccountOperator();
    public readonly chat_acc_op = new core.ChatAccountOperator();
    public readonly ama_acc_op = new core.AMAUserAccountOperator();

    public readonly mainlvl_data_op = new core.BaseMongoOperator({
        db: 'Level',
        coll: 'Data'
    });
    //

    constructor(f_bot: Etapocsm) {
        super(f_bot);

        this.managers = [
            new StaticDataSetter(this),
            new AutoUpdateAccountManager(this),
            new UserInteractionsManager(this),
            new UserManiManager(this)
        ];
    }
}
