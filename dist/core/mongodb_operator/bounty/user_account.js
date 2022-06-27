"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BountyUserAccountOperator = void 0;
const reglist_1 = require("../../../constants/reglist");
const base_1 = require("../base");
const reglist_2 = require("../../../db/reglist");
class BountyUserAccountOperator extends base_1.BaseMongoOperator {
    constructor() {
        super({
            db: "Bounty",
            coll: "Accounts",
            default_data_function: reglist_1.getDefaultBountyAccount
        });
    }
    async setAuth(user_id, new_auth) {
        const check_result = await this.checkDataExistence({ user_id: user_id });
        if (check_result.status === reglist_2.StatusCode.DATA_NOT_FOUND)
            return check_result;
        const execute = {
            $set: {
                auth: new_auth
            }
        };
        const update_result = await (await this.cursor).updateOne({ user_id: user_id }, execute);
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
exports.BountyUserAccountOperator = BountyUserAccountOperator;
