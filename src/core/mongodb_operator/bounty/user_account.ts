import { getDefaultBountyAccount } from '../../../constants/reglist';
import { BaseMongoOperator, OperatorResponse } from '../base';
import { StatusCode } from '../../../db/reglist';

export class BountyUserAccountOperator extends BaseMongoOperator {
    constructor() {
        super({
            db: "Bounty",
            coll: "Accounts",
            default_data_function: getDefaultBountyAccount
        });
    }

    public async setAuth(user_id: string, new_auth: boolean): Promise<OperatorResponse> {
        const check_result = await this.checkDataExistence({ user_id: user_id });
        if (check_result.status === StatusCode.DATA_NOT_FOUND) return check_result;

        const execute = {
            $set: {
                auth: new_auth
            }
        }

        const update_result = await (await this.cursor).updateOne({ user_id: user_id }, execute);
        if (!update_result.acknowledged) return {
            status: StatusCode.WRITE_DATA_ERROR,
            message: ':x: 寫入錯誤'
        };

        return {
            status: StatusCode.WRITE_DATA_SUCCESS,
            message: ':white_check_mark: 寫入成功'
        };
    }
}
