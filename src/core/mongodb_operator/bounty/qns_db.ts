import { getDefaultBountyQnsInfo } from '../../../constants/reglist';
import { BaseOperator, OperatorResponse } from '../base';

class BountyQnsDBOperator extends BaseOperator {
    constructor() {
        super({
            db: "Bounty",
            coll: "QnsInfo",
            default_data_function: getDefaultBountyQnsInfo
        });
    }

    public async setMaxChoices(user_id: string, new_max_choices: number): Promise<OperatorResponse> {
        const check_result = await this.checkDataExistence({ user_id: user_id });
        if (check_result.status === "M002") return check_result;

        const execute = {
            $set: {
                max_choices: new_max_choices
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

    public async setCorrectAns(user_id: string, new_correct_ans: string): Promise<OperatorResponse> {
        const check_result = await this.checkDataExistence({ user_id: user_id });
        if (check_result.status === "M002") return check_result;

        const execute = {
            $set: {
                correct_ans: new_correct_ans
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
    BountyQnsDBOperator
};
