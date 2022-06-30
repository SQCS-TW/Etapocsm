"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseMongoOperator = void 0;
const reglist_1 = require("../../db/reglist");
const reglist_2 = require("../../db/reglist");
const logger_1 = require("../logger");
class BaseMongoOperator {
    constructor(payload) {
        // use promise here due to non-async constructor
        this.cursor = (new reglist_1.Mongo(payload.db)).getCur(payload.coll);
        if (payload.default_data_function) {
            this.createDefaultDataFunction = payload.default_data_function;
        }
    }
    async checkDataExistence(payload, auto_create_account = false) {
        const user_data = await (await this.cursor).findOne(payload);
        if (user_data)
            return {
                status: reglist_2.StatusCode.DATA_FOUND
            };
        if (auto_create_account) {
            const result = await this.createDefaultData(payload);
            return result;
        }
        return {
            status: reglist_2.StatusCode.DATA_NOT_FOUND,
            message: ':x:**【查詢錯誤】**找不到資料'
        };
    }
    async createDefaultData(payload) {
        try {
            const default_data = await this.createDefaultDataFunction(payload);
            const result = await (await this.cursor).insertOne(default_data);
            if (result.acknowledged)
                return {
                    status: reglist_2.StatusCode.WRITE_DATA_SUCCESS
                };
            return {
                status: reglist_2.StatusCode.WRITE_DATA_ERROR,
                message: ':x:**【操作錯誤】**資料新增錯誤'
            };
        }
        catch (err) {
            logger_1.logger.error(err);
        }
    }
}
exports.BaseMongoOperator = BaseMongoOperator;
