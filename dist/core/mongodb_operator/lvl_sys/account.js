"use strict";
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
    async createUserMainAccount(user_id) {
        const user_data = await (await this.cursor_promise).findOne({ user_id: user_id });
        if (user_data)
            return;
        await this.createDefaultData({
            user_id: user_id
        });
    }
}
exports.MainLevelAccountOperator = MainLevelAccountOperator;
