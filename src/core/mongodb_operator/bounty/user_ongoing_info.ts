import { getDefaultUserOngoingData } from '../../../constants/reglist';
import { BaseOperator, OperatorResponse } from '../base';

class BountyUserOngoingInfoOperator extends BaseOperator {
    constructor() {
        super({
            db: "Bounty",
            coll: "Ongoing",
            default_data_function: getDefaultUserOngoingData
        });
    }

    public async setStatus(user_id: string, new_status: boolean): Promise<OperatorResponse> {
        const check_result = await this.checkDataExistence({ user_id: user_id });
        if (check_result.status === "M002") return check_result;

        const execute = {
            $set: {
                status: new_status
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

    public async isUserAnsweringQns(user_id: string): Promise<OperatorResponse> {
        const check_result = await this.checkDataExistence({ user_id: user_id });
        if (check_result.status === "M002") return check_result;

        const member_data = await (await this.cursor_promise).findOne({ user_id: user_id });

        if (member_data.status) return {
            status: true
        };
        return {
            status: false
        };
    }

    public async increaseStamina(user_id: string, delta: number, type: 'regular' | 'extra'): Promise<OperatorResponse> {
        const check_result = await this.checkDataExistence({ user_id: user_id });
        if (check_result.status === "M002") return check_result;

        const user_data = await (await this.cursor_promise).findOne({ user_id: user_id });
        const old_stamina = user_data.stamina;

        let execute: object;
        if (type === 'regular') {
            execute = {
                $set: {
                    stamina: {
                        regular: old_stamina.regular + delta,
                        extra: old_stamina.extra
                    }
                }
            }
        } else {
            execute = {
                $set: {
                    stamina: {
                        regular: old_stamina.regular,
                        extra: old_stamina.extra + delta
                    }
                }
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
    BountyUserOngoingInfoOperator
};
