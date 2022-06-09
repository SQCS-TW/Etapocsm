import { getDefaultBountyAccount } from '../../../constants/reglist';
import { BaseOperator, OperatorResponse } from '../base';

class BountyUserAccountOperator extends BaseOperator {
    constructor() {
        super({
            db: "Bounty",
            coll: "Accounts",
            default_data_function: getDefaultBountyAccount
        });
    }

    public async setAuth(user_id: string, new_auth: boolean): Promise<OperatorResponse> {
        const check_result = await this.checkDataExistence({ user_id: user_id });
        if (check_result.status === "M002") return check_result;

        const execute = {
            $set: {
                auth: new_auth
            }
        }

        const update_result = await (await this.cursor_promise).updateOne({ user_id: user_id }, execute);
        if (!update_result.acknowledged) return {
            status: "M003",
            message: ':x: 寫入錯誤'
        };

        return {
            status: "nM003",
            message: ':white_check_mark: 寫入成功'
        };
    }
}

export {
    BountyUserAccountOperator
};
