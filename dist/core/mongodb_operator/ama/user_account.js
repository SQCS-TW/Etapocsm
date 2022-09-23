"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AMAUserAccountOperator = void 0;
const reglist_1 = require("../../../constants/reglist");
const reglist_2 = require("../../../db/reglist");
const base_1 = require("../base");
class AMAUserAccountOperator extends base_1.BaseMongoOperator {
    constructor() {
        super({
            db: "AMA",
            coll: "Accounts",
            default_data_function: reglist_1.getDefaultAMAAccount
        });
    }
    async addExp(user_id, delta_exp) {
        const user_acc = await (await this.cursor).findOne({ user_id: user_id });
        if (!user_acc) {
            const default_data = await this.createDefaultDataFunction({
                user_id: user_id
            });
            const create_result = await (await this.cursor).insertOne(default_data);
            if (!create_result.acknowledged)
                return {
                    status: reglist_2.StatusCode.WRITE_DATA_ERROR,
                    message: ':x: 創建使用者帳號錯誤'
                };
        }
        const update_exp = {
            $inc: {
                exp: delta_exp
            }
        };
        const update_result = await (await this.cursor).updateOne({ user_id: user_id }, update_exp);
        if (!update_result.acknowledged)
            return {
                status: reglist_2.StatusCode.WRITE_DATA_ERROR,
                message: ':x: 寫入錯誤'
            };
        else
            return {
                status: reglist_2.StatusCode.WRITE_DATA_SUCCESS
            };
    }
}
exports.AMAUserAccountOperator = AMAUserAccountOperator;
