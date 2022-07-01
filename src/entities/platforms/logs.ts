import { core } from '../shortcut';
import { Etapocsm } from '../../bot';
import { LogsManager } from '../managers/logs/reglist';

export class LogsPlatform extends core.BasePlatform {
    constructor(f_bot: Etapocsm) {
        super(f_bot);

        this.managers = [
            new LogsManager(this)
        ];
    }
}
