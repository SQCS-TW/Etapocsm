import { core } from '../shortcut';
import { Etapocsm } from '../../bot';
import { AdministratorManager } from '../managers/admin/reglist';

export class AdministratorPlatform extends core.BasePlatform {
    constructor(f_bot: Etapocsm) {
        super(f_bot);

        this.managers = [
            new AdministratorManager(this)
        ];
    }
}
