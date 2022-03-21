import { BaseOperator, OperatorResponse } from './base';
import { getDefaultChatAccount } from '../../constants/reglist';


class ChatAccountOperator extends BaseOperator {
    constructor() {
        super('Chat', 'Accounts');
        this.createDefaultDataFunction = getDefaultChatAccount;
    }

    public async clearCooldown(user_id: string): Promise<OperatorResponse> {
        const check_result = await this.checkUserDataExistence(user_id);
        if (!check_result.status) return check_result;

        const execute = {
            $set: {
                cooldown: -1
            }
        };

        const update_result = await (await this.cursor_promise).updateOne({ user_id: user_id }, execute);
        if (!update_result.acknowledged) return {
            status: false,
            message: ':x:**【寫入錯誤】**'
        };

        return {
            status: true,
            message: ':white_check_mark:**【寫入成功】**'
        };
    }

    public async isUserInCooldown(user_id: string): Promise<OperatorResponse> {
        const check_result = await this.checkUserDataExistence(user_id);
        if (!check_result.status) return check_result;

        const member_data = await (await this.cursor_promise).findOne({ user_id: user_id });

        if (member_data.cooldown > Date.now()) return {
            status: true
        };
        return {
            status: false
        };
    }

    public async setCooldown(user_id: string, time: number): Promise<OperatorResponse> {
        const check_result = await this.checkUserDataExistence(user_id);
        if (!check_result.status) return check_result;

        const execute = {
            $set: {
                cooldown: time
            }
        };

        const update_result = await (await this.cursor_promise).updateOne({ user_id: user_id }, execute);
        if (!update_result.acknowledged) return {
            status: false,
            message: ':x: 寫入錯誤'
        };

        return {
            status: true,
            message: ':white_check_mark: 寫入成功'
        };
    }

    public async addExp(user_id: string, exp: number): Promise<OperatorResponse> {
        const check_result = await this.checkUserDataExistence(user_id);
        if (!check_result.status) return check_result;

        const execute = {
            $inc: {
                exp: exp
            }
        };

        const update_result = await (await this.cursor_promise).updateOne({ user_id: user_id }, execute);
        if (!update_result.acknowledged) return {
            status: false,
            message: ':x: 寫入錯誤'
        };

        return {
            status: true,
            message: ':white_check_mark: 寫入成功'
        };
    }
}

export {
    ChatAccountOperator
};
