"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultChatAccount = void 0;
const mongodb_1 = require("mongodb");
const getDefaultChatAccount = async function (payload) {
    return {
        _id: new mongodb_1.ObjectId(),
        user_id: payload.user_id,
        create_date: Date.now(),
        exp: 0,
        cooldown: -1
    };
};
exports.getDefaultChatAccount = getDefaultChatAccount;
