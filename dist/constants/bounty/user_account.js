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
exports.getDefaultBountyAccount = void 0;
const mongodb_1 = require("mongodb");
const getDefaultBountyAccount = function (payload) {
    return __awaiter(this, void 0, void 0, function* () {
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
    });
};
exports.getDefaultBountyAccount = getDefaultBountyAccount;
