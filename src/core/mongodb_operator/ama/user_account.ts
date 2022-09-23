import { getDefaultAMAAccount } from '../../../constants/reglist';
import { StatusCode } from '../../../db/reglist';
import { BaseMongoOperator } from '../base';


export class AMAUserAccountOperator extends BaseMongoOperator {
    constructor() {
        super({
            db: "AMA",
            coll: "Accounts",
            default_data_function: getDefaultAMAAccount
        });
    }

    public async addExp(user_id: string, delta_exp: number) {
        const user_acc = await (await this.cursor).findOne({ user_id: user_id });
        if (!user_acc) {
            const default_data = await this.createDefaultDataFunction({
                user_id: user_id
            });

            const create_result = await (await this.cursor).insertOne(default_data);
            if (!create_result.acknowledged) return {
                status: StatusCode.WRITE_DATA_ERROR,
                message: ':x: 創建使用者帳號錯誤'
            };
        }

        const update_exp = {
            $inc: {
                exp: delta_exp
            }
        };

        const update_result = await (await this.cursor).updateOne({ user_id: user_id }, update_exp);
        if (!update_result.acknowledged) return {
            status: StatusCode.WRITE_DATA_ERROR,
            message: ':x: 寫入錯誤'
        }; else return {
            status: StatusCode.WRITE_DATA_SUCCESS
        }
    }
}
