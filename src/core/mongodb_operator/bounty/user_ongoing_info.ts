import { getDefaultUserOngoingData } from '../../../constants/reglist';
import { BaseMongoOperator, OperatorResponse } from '../base';
import { StatusCode } from '../../../db/reglist';

export class BountyUserOngoingInfoOperator extends BaseMongoOperator {
    constructor() {
        super({
            db: "Bounty",
            coll: "Ongoing",
            default_data_function: getDefaultUserOngoingData
        });
    }

    public async setStatus(user_id: string, new_status: boolean): Promise<OperatorResponse> {
        const check_result = await this.checkDataExistence({ user_id: user_id });
        if (check_result.status === StatusCode.DATA_NOT_FOUND) return check_result;

        const execute = {
            $set: {
                status: new_status
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

    public async isUserAnsweringQns(user_id: string): Promise<OperatorResponse> {
        const check_result = await this.checkDataExistence({ user_id: user_id });
        if (check_result.status === StatusCode.DATA_NOT_FOUND) return check_result;

        const member_data = await (await this.cursor).findOne({ user_id: user_id });

        if (member_data.status) return {
            status: true
        };
        return {
            status: false
        };
    }

    public async increaseStamina(user_id: string, delta: number, type: 'regular' | 'extra'): Promise<OperatorResponse> {
        const check_result = await this.checkDataExistence({ user_id: user_id });
        if (check_result.status === StatusCode.DATA_NOT_FOUND) return check_result;

        const user_data = await (await this.cursor).findOne({ user_id: user_id });
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

