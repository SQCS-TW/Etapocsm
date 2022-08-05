"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseManager = void 0;
class BaseManager {
    constructor() {
        this.cmd_error = {
            content: ':x: 【使用錯誤】這個指令現在無法使用！'
        };
        this.perm_error = {
            content: ':x: 【權限不足】你無法使用這個指令！'
        };
        this.error_gif = ['./assets/gif/error.gif'];
    }
    async checkPerm(interaction, perm) {
        if (perm instanceof Array) {
            for (let i = 0; i < perm.length; i++) {
                const item = perm[i];
                if (!interaction.memberPermissions.has(item))
                    return false;
            }
        }
        else {
            if (!interaction.memberPermissions.has(perm))
                return false;
        }
        return true;
    }
}
exports.BaseManager = BaseManager;
