"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    setMaxChoices(diffi, qns_number, new_max_choices) {
        return __awaiter(this, void 0, void 0, function* () {
            const check_result = yield this.checkDataExistence({
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
            const update_result = yield (yield this.cursor_promise).updateOne({
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
        });
    }
    setCorrectAns(diffi, qns_number, new_answers) {
        return __awaiter(this, void 0, void 0, function* () {
            const check_result = yield this.checkDataExistence({
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
            const update_result = yield (yield this.cursor_promise).updateOne({
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
        });
    }
}
exports.BountyQnsDBOperator = BountyQnsDBOperator;
