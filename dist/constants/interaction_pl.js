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
exports.getDefaultInterAppli = void 0;
const mongodb_1 = require("mongodb");
const reglist_1 = require("../core/reglist");
const getDefaultInterAppli = function (user_id, type, due_after_seconds) {
    return __awaiter(this, void 0, void 0, function* () {
        return {
            _id: new mongodb_1.ObjectId(),
            user_id: user_id,
            type: type,
            due_time: (yield (0, reglist_1.timeAfterSecs)(due_after_seconds))
        };
    });
};
exports.getDefaultInterAppli = getDefaultInterAppli;
