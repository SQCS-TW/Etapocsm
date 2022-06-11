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
    setStatus(user_id, new_status) {
        return __awaiter(this, void 0, void 0, function* () {
            const check_result = yield this.checkDataExistence({ user_id: user_id });
            if (check_result.status === reglist_2.StatusCode.DATA_NOT_FOUND)
                return check_result;
            const execute = {
                $set: {
                    status: new_status
                }
            };
            const update_result = yield (yield this.cursor_promise).updateOne({ user_id: user_id }, execute);
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
    isUserAnsweringQns(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const check_result = yield this.checkDataExistence({ user_id: user_id });
            if (check_result.status === reglist_2.StatusCode.DATA_NOT_FOUND)
                return check_result;
            const member_data = yield (yield this.cursor_promise).findOne({ user_id: user_id });
            if (member_data.status)
                return {
                    status: true
                };
            return {
                status: false
            };
        });
    }
    increaseStamina(user_id, delta, type) {
        return __awaiter(this, void 0, void 0, function* () {
            const check_result = yield this.checkDataExistence({ user_id: user_id });
            if (check_result.status === reglist_2.StatusCode.DATA_NOT_FOUND)
                return check_result;
            const user_data = yield (yield this.cursor_promise).findOne({ user_id: user_id });
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
            const update_result = yield (yield this.cursor_promise).updateOne({ user_id: user_id }, execute);
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
exports.BountyUserOngoingInfoOperator = BountyUserOngoingInfoOperator;
