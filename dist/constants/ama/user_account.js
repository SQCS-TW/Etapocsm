"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultAMAAccount = void 0;
const mongodb_1 = require("mongodb");
const getDefaultAMAAccount = async function (payload) {
    return {
        _id: new mongodb_1.ObjectId(),
        user_id: payload.user_id,
        create_date: Date.now(),
        exp: 0,
        host_count: 0
    };
};
exports.getDefaultAMAAccount = getDefaultAMAAccount;
