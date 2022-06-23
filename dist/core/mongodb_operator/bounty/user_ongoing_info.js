"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BountyUserOngoingInfoOperator = void 0;
const reglist_1 = require("../../../constants/reglist");
const base_1 = require("../base");
const reglist_2 = require("../../../db/reglist");
class BountyUserOngoingInfoOperator extends base_1.BaseOperator {
    constructor() {
        super({
            db: "Bounty",
            coll: "Ongoing",
            default_data_function: reglist_1.getDefaultUserOngoingData
        });
    }
    async setStatus(user_id, new_status) {
        const check_result = await this.checkDataExistence({ user_id: user_id });
        if (check_result.status === reglist_2.StatusCode.DATA_NOT_FOUND)
            return check_result;
        const execute = {
            $set: {
                status: new_status
            }
        };
        const update_result = await (await this.cursor_promise).updateOne({ user_id: user_id }, execute);
        if (!update_result.acknowledged)
            return {
                status: reglist_2.StatusCode.WRITE_DATA_ERROR,
                message: ':x: 寫入錯誤'
            };
        return {
            status: reglist_2.StatusCode.WRITE_DATA_SUCCESS,
            message: ':white_check_mark: 寫入成功'
        };
    }
    async isUserAnsweringQns(user_id) {
        const check_result = await this.checkDataExistence({ user_id: user_id });
        if (check_result.status === reglist_2.StatusCode.DATA_NOT_FOUND)
            return check_result;
        const member_data = await (await this.cursor_promise).findOne({ user_id: user_id });
        if (member_data.status)
            return {
                status: true
            };
        return {
            status: false
        };
    }
    async increaseStamina(user_id, delta, type) {
        const check_result = await this.checkDataExistence({ user_id: user_id });
        if (check_result.status === reglist_2.StatusCode.DATA_NOT_FOUND)
            return check_result;
        const user_data = await (await this.cursor_promise).findOne({ user_id: user_id });
        const old_stamina = user_data.stamina;
        let execute;
        if (type === 'regular') {
            execute = {
                $set: {
                    stamina: {
                        regular: old_stamina.regular + delta,
                        extra: old_stamina.extra
                    }
                }
            };
        }
        else {
            execute = {
                $set: {
                    stamina: {
                        regular: old_stamina.regular,
                        extra: old_stamina.extra + delta
                    }
                }
            };
        }
        const update_result = await (await this.cursor_promise).updateOne({ user_id: user_id }, execute);
        if (!update_result.acknowledged)
            return {
                status: reglist_2.StatusCode.WRITE_DATA_ERROR,
                message: ':x: 寫入錯誤'
            };
        return {
            status: reglist_2.StatusCode.WRITE_DATA_SUCCESS,
            message: ':white_check_mark: 寫入成功'
        };
    }
}
exports.BountyUserOngoingInfoOperator = BountyUserOngoingInfoOperator;
