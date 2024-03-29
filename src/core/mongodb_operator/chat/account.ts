import { BaseMongoOperator, OperatorResponse } from '../base';
import { getDefaultChatAccount } from '../../../constants/reglist';
import * as core from '../../reglist';


export class ChatAccountOperator extends BaseMongoOperator {
    private mainlvl_acc_op: core.MainLevelAccountOperator;

    constructor() {
        super({
            db: "Chat",
            coll: "Accounts",
            default_data_function: getDefaultChatAccount
        });

        this.mainlvl_acc_op = new core.MainLevelAccountOperator();
    }

    public async isUserInCooldown(user_id: string): Promise<OperatorResponse> {
        const check_result = await this.checkDataExistence({ user_id: user_id }, true);
        if (check_result.status === 'M003') {
            return check_result;
        } else if (check_result.status === 'nM003') {
            await this.mainlvl_acc_op.createUserMainAccount(user_id);
            return {
                status: false
            }
        }

        const member_data = await (await this.cursor).findOne({ user_id: user_id });

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

        const update_result = await (await this.cursor).updateOne({ user_id: user_id }, execute);
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

        const update_result = await (await this.cursor).updateOne({ user_id: user_id }, execute);
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
