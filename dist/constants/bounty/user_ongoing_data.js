"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultUserOngoingData = void 0;
const mongodb_1 = require("mongodb");
const getDefaultUserOngoingData = async function (payload) {
    return {
        _id: new mongodb_1.ObjectId(),
        user_id: payload.user_id,
        status: false,
        qns_thread: {
            easy: payload.qns_thread.easy,
            medium: payload.qns_thread.medium,
            hard: payload.qns_thread.hard
        },
        stamina: {
            regular: 3,
            extra: 0,
            extra_gained: 0
        }
    };
};
exports.getDefaultUserOngoingData = getDefaultUserOngoingData;
