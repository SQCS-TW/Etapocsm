"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BountyQnsDBOperator = void 0;
const reglist_1 = require("../../../constants/reglist");
const base_1 = require("../base");
const reglist_2 = require("../../../db/reglist");
class BountyQnsDBOperator extends base_1.BaseOperator {
    constructor() {
        super({
            db: "Bounty",
            coll: "Questions",
            default_data_function: reglist_1.getDefaultBountyQnsInfo
        });
    }
    async setMaxChoices(diffi, qns_number, new_max_choices) {
        const check_result = await this.checkDataExistence({
            difficulty: diffi,
            number: qns_number
        });
        if (check_result.status === reglist_2.StatusCode.DATA_NOT_FOUND)
            return check_result;
        const execute = {
            $set: {
                max_choices: new_max_choices
            }
        };
        const update_result = await (await this.cursor_promise).updateOne({
            difficulty: diffi,
            number: qns_number
        }, execute);
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
    async setCorrectAns(diffi, qns_number, new_answers) {
        const check_result = await this.checkDataExistence({
            difficulty: diffi,
            number: qns_number
        });
        if (check_result.status === reglist_2.StatusCode.DATA_NOT_FOUND)
            return check_result;
        const execute = {
            $set: {
                correct_ans: new_answers
            }
        };
        const update_result = await (await this.cursor_promise).updateOne({
            difficulty: diffi,
            number: qns_number
        }, execute);
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
exports.BountyQnsDBOperator = BountyQnsDBOperator;
