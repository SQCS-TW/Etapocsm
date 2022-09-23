import { core } from '../shortcut';
import { Etapocsm } from '../../bot';
import { ReactionExpManager } from '../../entities/managers/ama/reglist';

export class AMAPlatform extends core.BasePlatform {
    public readonly mainlvl_acc_op = new core.MainLevelAccountOperator();

    public readonly ama_acc_op = new core.AMAUserAccountOperator();

    public readonly react_event_op = new core.BaseMongoOperator({
        db: 'AMA',
        coll: 'ReactionEvent'
    });

    constructor(f_bot: Etapocsm) {
        super(f_bot);

        this.managers = [
            new ReactionExpManager(this)
        ];
    }
}
