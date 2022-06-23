import { getDefaultBountyQnsInfo } from '../../../constants/reglist';
import { BaseMongoOperator, OperatorResponse } from '../base';
import { StatusCode } from '../../../db/reglist';

export class BountyQnsDBOperator extends BaseMongoOperator {
    constructor() {
        super({
            db: "Bounty",
            coll: "Questions",
            default_data_function: getDefaultBountyQnsInfo
        });
    }

    public async setMaxChoices(diffi: string, qns_number: number, new_max_choices: number): Promise<OperatorResponse> {
        const check_result = await this.checkDataExistence({
            difficulty: diffi,
            number: qns_number
        });
        if (check_result.status === StatusCode.DATA_NOT_FOUND) return check_result;

        const execute = {
            $set: {
                max_choices: new_max_choices
            }
        }

        const update_result = await (await this.cursor_promise).updateOne({
            difficulty: diffi,
            number: qns_number
        }, execute);
        if (!update_result.acknowledged) return {
            status: StatusCode.WRITE_DATA_ERROR,
            message: ':x: 寫入錯誤'
        };

        return {
            status: StatusCode.WRITE_DATA_SUCCESS,
            message: ':white_check_mark: 寫入成功'
        };
    }

    public async setCorrectAns(diffi: string, qns_number: number, new_answers: string[]): Promise<OperatorResponse> {
        const check_result = await this.checkDataExistence({
            difficulty: diffi,
            number: qns_number
        });
        if (check_result.status === StatusCode.DATA_NOT_FOUND) return check_result;

        const execute = {
            $set: {
                correct_ans: new_answers
            }
        }

        const update_result = await (await this.cursor_promise).updateOne({
            difficulty: diffi,
            number: qns_number
        }, execute);
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
