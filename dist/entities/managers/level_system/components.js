"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USER_MANI_SLCMD_REGISTER_LIST = exports.USER_INTERACTION_SLCMD_REGISTER_LIST = void 0;
const discord_js_1 = require("discord.js");
exports.USER_INTERACTION_SLCMD_REGISTER_LIST = [
    {
        name: 'check-lvl-data',
        description: '查看個人等級資訊',
    },
    {
        name: 'check-lvl-rank',
        description: '列出總經驗值前十排行榜'
    }
];
exports.USER_MANI_SLCMD_REGISTER_LIST = [
    {
        name: 'mani-exp-multiplier',
        description: '修改用戶經驗倍數',
        options: [
            {
                name: 'id',
                description: '用戶的 discord id',
                type: discord_js_1.Constants.ApplicationCommandOptionTypes.STRING,
                required: true
            },
            {
                name: 'new-multiplier',
                description: '新的經驗倍數，取值到小數點後第一位',
                type: discord_js_1.Constants.ApplicationCommandOptionTypes.NUMBER,
                required: true
            }
        ]
    }
];
