"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REGISTER_LIST = void 0;
const discord_js_1 = require("discord.js");
const REGISTER_LIST = [
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
        name: 'edit-qns-max-choices',
        description: '修改問題的總選項個數',
        options: [
            {
                name: '_id',
                description: '問題 _id',
                type: discord_js_1.Constants.ApplicationCommandOptionTypes.STRING,
                required: true
            },
            {
                name: 'max-choices',
                description: '新的總選項個數',
                type: discord_js_1.Constants.ApplicationCommandOptionTypes.INTEGER,
                required: true
            }
        ]
    },
    {
        name: 'modify_answers',
        description: '修改問題答案',
        options: [
            {
                name: '_id',
                description: '問題 _id',
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
exports.REGISTER_LIST = REGISTER_LIST;
