import { core } from '../shortcut';
import { Etapocsm } from '../../bot';
import { ChatListener } from '../managers/chat_exp/reglist';

export class ChatExpPlatform extends core.BasePlatform {
    // operators for child manager
    public readonly account_op = new core.ChatAccountOperator();
    public readonly mainlvl_acc_op = new core.MainLevelAccountOperator();
    //

    constructor(f_bot: Etapocsm) {
        super(f_bot);

        this.managers = [
            new ChatListener(this)
        ];
    }
}
