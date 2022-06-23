"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultBountyAccount = void 0;
const mongodb_1 = require("mongodb");
const getDefaultBountyAccount = async function (payload) {
    return {
        _id: new mongodb_1.ObjectId(),
        user_id: payload.user_id,
        create_date: Date.now(),
        auth: true,
        exp: 0,
        qns_record: {
            answered_qns_count: {
                easy: 0,
                medium: 0,
                hard: 0
            },
            correct_qns_count: {
                easy: 0,
                medium: 0,
                hard: 0
            },
            answered_qns_number: {
                easy: [],
                medium: [],
                hard: []
            }
        },
        personal_record: {
            thread_cleared_count: 0,
            thread_all_cleared_count: 0,
            extra_stamina_gained_count: 0
        }
    };
};
exports.getDefaultBountyAccount = getDefaultBountyAccount;
