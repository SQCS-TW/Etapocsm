import { core } from '../shortcut';
import { Etapocsm } from '../../bot';
import { ChatListener } from '../managers/lvl_sys/reglist';

export class LvlSysPlatform extends core.BasePlatform {
    constructor(f_bot: Etapocsm) {
        super(f_bot);

        this.managers = [
            new ChatListener(this)
        ]
    }
}
