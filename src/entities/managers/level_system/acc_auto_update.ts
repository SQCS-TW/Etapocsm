import { core, db } from '../../shortcut';

export class AutoUpdateAccountManager extends core.BaseManager {
    private mainlvlacc_op: core.MainLevelAccountOperator;
    private json_op: core.jsonOperator;

    private mins_in_mili_secs = 60 * 1000;

    private cache_path = './cache/bounty/end_btn.json';

    constructor(f_platform: core.BasePlatform) {
        super(f_platform);

        this.mainlvlacc_op = new core.MainLevelAccountOperator();
        this.json_op = new core.jsonOperator();

        this.setupListener();
    }

    private async setupListener() {
        this.f_platform.f_bot.on('ready', async () => {
            await this.updateTotalExp();
        });
    }

    private async updateTotalExp() {
        console.log('once update exp');

        if (this.json_op === undefined) console.log('no');
        else console.log('yes');

        const data = await this.json_op.readFile(this.cache_path);
        console.log(data);

        return setTimeout(async () => { await this.updateTotalExp() }, 2 * 60 * 1000);
    }

    private async updateCurrLevel() {
        console.log('once update curr lvl');
        return setTimeout(async () => { await this.updateCurrLevel() }, 5 * 60 * 1000);
    }
}
