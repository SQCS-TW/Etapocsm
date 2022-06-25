"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REGISTER_LIST = void 0;
const discord_js_1 = require("discord.js");
exports.REGISTER_LIST = [
    {
        name: 'mani-bounty-auth',
        description: '修改用戶回答懸賞題的權限',
        options: [
            {
                name: 'id',
                description: '用戶的 discord id',
                type: discord_js_1.Constants.ApplicationCommandOptionTypes.STRING,
                required: true
            },
            {
                name: 'new-auth',
                description: '新的權限',
                type: discord_js_1.Constants.ApplicationCommandOptionTypes.BOOLEAN,
                required: true
            }
        ]
    },
    {
        name: 'mani-bounty-status',
        description: '修改用戶懸賞題的進行狀態',
        options: [
            {
                name: 'id',
                description: '用戶的 discord id',
                type: discord_js_1.Constants.ApplicationCommandOptionTypes.STRING,
                required: true
            },
            {
                name: 'new-status',
                description: '新的狀態',
                type: discord_js_1.Constants.ApplicationCommandOptionTypes.BOOLEAN,
                required: true
            }
        ]
    }
];
