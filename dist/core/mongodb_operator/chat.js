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
exports.ChatAccountOperator = void 0;
const base_1 = require("./base");
const reglist_1 = require("../../constants/reglist");
const reglist_2 = require("../../core/reglist");
class ChatAccountOperator extends base_1.BaseOperator {
    constructor() {
        super({
            db: "Chat",
            coll: "Accounts",
            default_data_function: reglist_1.getDefaultChatAccount
        });
    }
    clearCooldown(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const check_result = yield this.checkDataExistence({ user_id: user_id });
            if (reglist_2.isItemInArray)
                return check_result;
            const execute = {
                $set: {
                    cooldown: -1
                }
            };
            const update_result = yield (yield this.cursor_promise).updateOne({ user_id: user_id }, execute);
            if (!update_result.acknowledged)
                return {
                    status: "M003",
                    message: ':x:**【寫入錯誤】**'
                };
            return {
                status: "nM003",
                message: ':white_check_mark:**【寫入成功】**'
            };
        });
    }
    isUserInCooldown(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const check_result = yield this.checkDataExistence({ user_id: user_id }, true);
            if (check_result.status === 'M003') {
                return check_result;
            }
            else if (check_result.status === 'nM003') {
                return {
                    status: false
                };
            }
            const member_data = yield (yield this.cursor_promise).findOne({ user_id: user_id });
            if (member_data.cooldown > Date.now())
                return {
                    status: true
                };
            return {
                status: false
            };
        });
    }
    setCooldown(user_id, time) {
        return __awaiter(this, void 0, void 0, function* () {
            const check_result = yield this.checkDataExistence({ user_id: user_id });
            if (check_result.status === "M002")
                return check_result;
            const execute = {
                $set: {
                    cooldown: time
                }
            };
            const update_result = yield (yield this.cursor_promise).updateOne({ user_id: user_id }, execute);
            if (!update_result.acknowledged)
                return {
                    status: "M003",
                    message: ':x: 寫入錯誤'
                };
            return {
                status: "nM003",
                message: ':white_check_mark: 寫入成功'
            };
        });
    }
    addExp(user_id, exp) {
        return __awaiter(this, void 0, void 0, function* () {
            const check_result = yield this.checkDataExistence({ user_id: user_id });
            if (check_result.status === "M002")
                return check_result;
            const execute = {
                $inc: {
                    exp: exp
                }
            };
            const update_result = yield (yield this.cursor_promise).updateOne({ user_id: user_id }, execute);
            if (!update_result.acknowledged)
                return {
                    status: "M003",
                    message: ':x: 寫入錯誤'
                };
            return {
                status: "nM003",
                message: ':white_check_mark: 寫入成功'
            };
        });
    }
}
exports.ChatAccountOperator = ChatAccountOperator;
