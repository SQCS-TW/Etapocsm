import { Etapocsm } from '../../bot';
import { BaseManager } from './manager';

class BasePlatform {
    public f_bot: Etapocsm;
    
    public managers: Array<BaseManager>;

    constructor(f_bot: Etapocsm) {
        this.f_bot = f_bot;
    }
}

export {
    BasePlatform
};
