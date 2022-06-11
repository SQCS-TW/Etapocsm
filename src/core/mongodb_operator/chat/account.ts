import { BaseOperator, OperatorResponse } from '../base';
import { getDefaultChatAccount } from '../../../constants/reglist';
import { isItemInArray } from '../../reglist';


export class ChatAccountOperator extends BaseOperator {
    constructor() {
        super({
            db: "Chat",
            coll: "Accounts",
            default_data_function: getDefaultChatAccount
        });
    }

    public async clearCooldown(user_id: string): Promise<OperatorResponse> {
        const check_result = await this.checkDataExistence({ user_id: user_id });
        if (isItemInArray) return check_result;

        const execute = {
            $set: {
                cooldown: -1
            }
        };

        const update_result = await (await this.cursor_promise).updateOne({ user_id: user_id }, execute);
        if (!update_result.acknowledged) return {
            status: "M003",
            message: ':x:**【寫入錯誤】**'
        };

        return {
            status: "nM003",
            message: ':white_check_mark:**【寫入成功】**'
        };
    }

    public async isUserInCooldown(user_id: string): Promise<OperatorResponse> {
        const check_result = await this.checkDataExistence({ user_id: user_id }, true);
        if (check_result.status === 'M003') {
            return check_result;
        } else if (check_result.status === 'nM003') {
            return {
                status: false
            }
        }

        const member_data = await (await this.cursor_promise).findOne({ user_id: user_id });

        if (member_data.cooldown > Date.now()) return {
            status: true
        };
        return {
            status: false
        };
    }

    public async setCooldown(user_id: string, time: number): Promise<OperatorResponse> {
        const check_result = await this.checkDataExistence({ user_id: user_id });
        if (check_result.status === "M002") return check_result;

        const execute = {
            $set: {
                cooldown: time
            }
        };

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

    public async addExp(user_id: string, exp: number): Promise<OperatorResponse> {
        const check_result = await this.checkDataExistence({ user_id: user_id });
        if (check_result.status === "M002") return check_result;

        const execute = {
            $inc: {
                exp: exp
            }
        };

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
