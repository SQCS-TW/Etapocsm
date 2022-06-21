import { core } from '../shortcut';
import { Etapocsm } from '../../bot';
import { ChatListener } from '../managers/chat_exp/reglist';

export class ChatExpPlatform extends core.BasePlatform {
    constructor(f_bot: Etapocsm) {
        super(f_bot);

        this.managers = [
            new ChatListener(this)
        ]
    }
}
