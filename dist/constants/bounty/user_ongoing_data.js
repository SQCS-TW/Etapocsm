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
exports.getDefaultUserOngoingData = void 0;
const mongodb_1 = require("mongodb");
const getDefaultUserOngoingData = function (payload) {
    return __awaiter(this, void 0, void 0, function* () {
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
                extra: 0
            },
            time: {
                start: -1,
                end: -1,
                duration: -1
            }
        };
    });
};
exports.getDefaultUserOngoingData = getDefaultUserOngoingData;
