"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultMainLevelAccount = void 0;
const mongodb_1 = require("mongodb");
const getDefaultMainLevelAccount = async function (payload) {
    return {
        _id: new mongodb_1.ObjectId(),
        user_id: payload.user_id,
        create_date: Date.now(),
        total_exp: 0,
        level: 0,
        curr_role_id: '947153762257100830'
    };
};
exports.getDefaultMainLevelAccount = getDefaultMainLevelAccount;
