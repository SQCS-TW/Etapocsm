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
exports.BaseManager = void 0;
class BaseManager {
    constructor(f_platform) {
        this.f_platform = f_platform;
        this.cmd_error = {
            content: ':x: 【使用錯誤】這個指令現在無法使用！'
        };
        this.perm_error = {
            content: ':x: 【權限不足】你無法使用這個指令！'
        };
        // file to send when sth goes wrong
        this.error_gif = ['./assets/gif/error.gif'];
    }
    checkPerm(interaction, perm) {
        return __awaiter(this, void 0, void 0, function* () {
            if (perm instanceof Array) {
                perm.forEach((item) => {
                    if (!interaction.memberPermissions.has(item))
                        return false;
                });
            }
            else {
                if (!interaction.memberPermissions.has(perm))
                    return false;
            }
            return true;
        });
    }
}
exports.BaseManager = BaseManager;
