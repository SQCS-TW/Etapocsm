"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SLCMD_REGISTER_LIST = void 0;
const discord_js_1 = require("discord.js");
const SLCMD_REGISTER_LIST = [
    {
        name: 'activate',
        description: '建立問題資料庫'
    },
    {
        name: 'modify_choices',
        description: '修改問題選項',
        options: [
            {
                name: 'id',
                description: '問題id',
                type: discord_js_1.Constants.ApplicationCommandOptionTypes.STRING,
                required: true
            },
            {
                name: 'choices',
                description: '問題所有選項（用;隔開）',
                type: discord_js_1.Constants.ApplicationCommandOptionTypes.STRING,
                required: true
            }
        ]
    },
    {
        name: 'modify_answers',
        description: '修改問題答案',
        options: [
            {
                name: 'id',
                description: '問題id',
                type: discord_js_1.Constants.ApplicationCommandOptionTypes.STRING,
                required: true
            },
            {
                name: 'ans',
                description: '問題所有答案（用;隔開）',
                type: discord_js_1.Constants.ApplicationCommandOptionTypes.STRING,
                required: true
            }
        ]
    }
];
exports.SLCMD_REGISTER_LIST = SLCMD_REGISTER_LIST;
