"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REGISTER_LIST = void 0;
const discord_js_1 = require("discord.js");
exports.REGISTER_LIST = [
    {
        name: 'create-bounty-qns',
        description: '新增懸賞問題',
        options: [
            {
                name: 'difficulty',
                description: '難度',
                type: discord_js_1.Constants.ApplicationCommandOptionTypes.STRING,
                required: true,
                choices: [
                    {
                        name: '簡單',
                        value: 'easy'
                    },
                    {
                        name: '普通',
                        value: 'medium'
                    },
                    {
                        name: '困難',
                        value: 'hard'
                    }
                ]
            },
            {
                name: 'max-choices',
                description: '選項總數目',
                type: discord_js_1.Constants.ApplicationCommandOptionTypes.INTEGER,
                required: true
            },
            {
                name: 'correct-ans',
                description: '正確選項（用;隔開）',
                type: discord_js_1.Constants.ApplicationCommandOptionTypes.STRING,
                required: true
            }
        ]
    },
    {
        name: 'edit-bounty-qns-max-choices',
        description: '修改問題的總選項個數',
        options: [
            {
                name: 'difficulty',
                description: '要修改問題的難度',
                type: discord_js_1.Constants.ApplicationCommandOptionTypes.STRING,
                required: true,
                choices: [
                    {
                        name: '簡單',
                        value: 'easy'
                    },
                    {
                        name: '普通',
                        value: 'medium'
                    },
                    {
                        name: '困難',
                        value: 'hard'
                    }
                ]
            },
            {
                name: 'number',
                description: '要修改問題的編號',
                type: discord_js_1.Constants.ApplicationCommandOptionTypes.INTEGER,
                required: true
            },
            {
                name: 'new-max-choices',
                description: '新的總選項個數',
                type: discord_js_1.Constants.ApplicationCommandOptionTypes.INTEGER,
                required: true
            }
        ]
    },
    {
        name: 'edit-bounty-qns-answers',
        description: '修改問題答案',
        options: [
            {
                name: 'difficulty',
                description: '要修改問題的難度',
                type: discord_js_1.Constants.ApplicationCommandOptionTypes.STRING,
                required: true,
                choices: [
                    {
                        name: '簡單',
                        value: 'easy'
                    },
                    {
                        name: '普通',
                        value: 'medium'
                    },
                    {
                        name: '困難',
                        value: 'hard'
                    }
                ]
            },
            {
                name: 'number',
                description: '要修改問題的編號',
                type: discord_js_1.Constants.ApplicationCommandOptionTypes.INTEGER,
                required: true
            },
            {
                name: 'new-answers',
                description: '新的所有答案（用;隔開）',
                type: discord_js_1.Constants.ApplicationCommandOptionTypes.STRING,
                required: true
            }
        ]
    },
    {
        name: 'log-create-bounty-qns-actions',
        description: '查詢個人新增懸賞問題的操作',
    },
    {
        name: 'del-create-bounty-qns-action',
        description: '刪除個人新增懸賞問題的操作',
        options: [
            {
                name: 'difficulty',
                description: '要修改問題的難度',
                type: discord_js_1.Constants.ApplicationCommandOptionTypes.STRING,
                required: true,
                choices: [
                    {
                        name: '簡單',
                        value: 'easy'
                    },
                    {
                        name: '普通',
                        value: 'medium'
                    },
                    {
                        name: '困難',
                        value: 'hard'
                    }
                ]
            },
            {
                name: 'number',
                description: '要修改問題的編號',
                type: discord_js_1.Constants.ApplicationCommandOptionTypes.INTEGER,
                required: true
            }
        ]
    }
];
