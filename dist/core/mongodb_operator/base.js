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
exports.BaseOperator = void 0;
const reglist_1 = require("../../db/reglist");
class BaseOperator {
    constructor(payload) {
        // use promise here due to non-async constructor
        this.cursor_promise = (new reglist_1.Mongo(payload.db)).getCur(payload.coll);
        if (payload.default_data_function) {
            this.createDefaultDataFunction = payload.default_data_function;
        }
    }
    checkDataExistence(payload, auto_create_account = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const user_data = yield (yield this.cursor_promise).findOne(payload);
            if (user_data)
                return {
                    status: "nM002"
                };
            if (auto_create_account) {
                const result = yield this.createUserData(payload);
                return result;
            }
            return {
                status: "M002",
                message: ':x:**【查詢錯誤】**找不到用戶資料'
            };
        });
    }
    createUserData(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const default_data = yield this.createDefaultDataFunction(payload);
                const result = yield (yield this.cursor_promise).insertOne(default_data);
                if (result.acknowledged)
                    return {
                        status: "nM003"
                    };
                return {
                    status: "M003",
                    message: ':x:**【操作錯誤】**資料新增錯誤'
                };
            }
            catch (err) {
                console.log(err);
            }
        });
    }
}
exports.BaseOperator = BaseOperator;
