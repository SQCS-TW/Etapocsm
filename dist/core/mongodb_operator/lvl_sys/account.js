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
exports.MainLevelAccountOperator = void 0;
const base_1 = require("../base");
const reglist_1 = require("../../../constants/reglist");
class MainLevelAccountOperator extends base_1.BaseOperator {
    constructor() {
        super({
            db: "Level",
            coll: "Accounts",
            default_data_function: reglist_1.getDefaultMainLevelAccount
        });
    }
    createUserMainAccount(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user_data = yield (yield this.cursor_promise).findOne({ user_id: user_id });
            if (user_data)
                return;
            yield this.createDefaultData({
                user_id: user_id
            });
        });
    }
}
exports.MainLevelAccountOperator = MainLevelAccountOperator;
