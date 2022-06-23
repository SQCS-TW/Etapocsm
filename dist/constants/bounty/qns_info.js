"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultBountyQnsInfo = void 0;
const mongodb_1 = require("mongodb");
const getDefaultBountyQnsInfo = async function (payload) {
    return {
        _id: new mongodb_1.ObjectId(),
        difficulty: payload.difficulty,
        number: payload.qns_number,
        max_choices: payload.max_choices,
        correct_ans: payload.correct_ans
    };
};
exports.getDefaultBountyQnsInfo = getDefaultBountyQnsInfo;
