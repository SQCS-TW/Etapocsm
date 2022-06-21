"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.ChatAccountOperator = void 0;
const base_1 = require("../base");
const reglist_1 = require("../../../constants/reglist");
const reglist_2 = require("../../reglist");
const core = __importStar(require("../../reglist"));
class ChatAccountOperator extends base_1.BaseOperator {
    constructor() {
        super({
            db: "Chat",
            coll: "Accounts",
            default_data_function: reglist_1.getDefaultChatAccount
        });
        this.mainlvlacc_op = new core.MainLevelAccountOperator();
    }
    clearCooldown(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const check_result = yield this.checkDataExistence({ user_id: user_id });
            if (reglist_2.isItemInArray)
                return check_result;
            const execute = {
                $set: {
                    cooldown: -1
                }
            };
            const update_result = yield (yield this.cursor_promise).updateOne({ user_id: user_id }, execute);
            if (!update_result.acknowledged)
                return {
                    status: "M003",
                    message: ':x:**【寫入錯誤】**'
                };
            return {
                status: "nM003",
                message: ':white_check_mark:**【寫入成功】**'
            };
        });
    }
    isUserInCooldown(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const check_result = yield this.checkDataExistence({ user_id: user_id }, true);
            if (check_result.status === 'M003') {
                return check_result;
            }
            else if (check_result.status === 'nM003') {
                yield this.mainlvlacc_op.createUserMainAccount(user_id);
                return {
                    status: false
                };
            }
            const member_data = yield (yield this.cursor_promise).findOne({ user_id: user_id });
            if (member_data.cooldown > Date.now())
                return {
                    status: true
                };
            return {
                status: false
            };
        });
    }
    setCooldown(user_id, time) {
        return __awaiter(this, void 0, void 0, function* () {
            const check_result = yield this.checkDataExistence({ user_id: user_id });
            if (check_result.status === "M002")
                return check_result;
            const execute = {
                $set: {
                    cooldown: time
                }
            };
            const update_result = yield (yield this.cursor_promise).updateOne({ user_id: user_id }, execute);
            if (!update_result.acknowledged)
                return {
                    status: "M003",
                    message: ':x: 寫入錯誤'
                };
            return {
                status: "nM003",
                message: ':white_check_mark: 寫入成功'
            };
        });
    }
    addExp(user_id, exp) {
        return __awaiter(this, void 0, void 0, function* () {
            const check_result = yield this.checkDataExistence({ user_id: user_id });
            if (check_result.status === "M002")
                return check_result;
            const execute = {
                $inc: {
                    exp: exp
                }
            };
            const update_result = yield (yield this.cursor_promise).updateOne({ user_id: user_id }, execute);
            if (!update_result.acknowledged)
                return {
                    status: "M003",
                    message: ':x: 寫入錯誤'
                };
            return {
                status: "nM003",
                message: ':white_check_mark: 寫入成功'
            };
        });
    }
}
exports.ChatAccountOperator = ChatAccountOperator;
