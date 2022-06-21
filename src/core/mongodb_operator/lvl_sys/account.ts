import { BaseOperator } from '../base';
import { getDefaultMainLevelAccount } from '../../../constants/reglist';

export class MainLevelAccountOperator extends BaseOperator {
    constructor() {
        super({
            db: "Level",
            coll: "Accounts",
            default_data_function: getDefaultMainLevelAccount
        });
    }

    public async createUserMainAccount(user_id: string) {
        const user_data = await (await this.cursor_promise).findOne({ user_id: user_id });
        if (user_data) return;

        await this.createDefaultData({
            user_id: user_id
        });
    }
}
