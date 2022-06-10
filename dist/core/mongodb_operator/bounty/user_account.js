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
exports.BountyUserAccountOperator = void 0;
const reglist_1 = require("../../../constants/reglist");
const base_1 = require("../base");
class BountyUserAccountOperator extends base_1.BaseOperator {
    constructor() {
        super({
            db: "Bounty",
            coll: "Accounts",
            default_data_function: reglist_1.getDefaultBountyAccount
        });
    }
    setAuth(user_id, new_auth) {
        return __awaiter(this, void 0, void 0, function* () {
            const check_result = yield this.checkDataExistence({ user_id: user_id });
            if (check_result.status === "M002")
                return check_result;
            const execute = {
                $set: {
                    auth: new_auth
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
exports.BountyUserAccountOperator = BountyUserAccountOperator;
