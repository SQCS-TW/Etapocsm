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
exports.getDefaultBountyQnsInfo = void 0;
const mongodb_1 = require("mongodb");
const getDefaultBountyQnsInfo = function (payload) {
    return __awaiter(this, void 0, void 0, function* () {
        return {
            _id: new mongodb_1.ObjectId(),
            difficulty: payload.difficulty,
            qns_number: payload.qns_number,
            max_choices: payload.max_choices,
            correct_ans: payload.correct_ans
        };
    });
};
exports.getDefaultBountyQnsInfo = getDefaultBountyQnsInfo;
