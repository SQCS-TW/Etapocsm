"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHOOSE_BOUNTY_ANS_DROPDOWN = exports.CHOOSE_BOUNTY_DIFFICULTY_DROPDOWN = exports.END_SLCMD_REGISTER_LIST = exports.START_SLCMD_REGISTER_LIST = exports.ADMIN_SLCMD_LIST = void 0;
const discord_js_1 = require("discord.js");
const ADMIN_SLCMD_LIST = [
    {
        name: 'set_status',
        description: '設定用戶狀態',
        options: [
            {
                name: 'user_id',
                description: '用戶id',
                type: discord_js_1.Constants.ApplicationCommandOptionTypes.STRING,
                required: true
            },
            {
                name: 'status',
                description: '新的用戶狀態',
                type: discord_js_1.Constants.ApplicationCommandOptionTypes.BOOLEAN,
                required: true
            }
        ]
    }
];
exports.ADMIN_SLCMD_LIST = ADMIN_SLCMD_LIST;
const START_SLCMD_REGISTER_LIST = [
    {
        name: 'activate_bounty',
        description: '開始懸賞活動'
    }
];
exports.START_SLCMD_REGISTER_LIST = START_SLCMD_REGISTER_LIST;
const END_SLCMD_REGISTER_LIST = [
    {
        name: 'end_bounty',
        description: '結束懸賞活動（回答問題）'
    }
];
exports.END_SLCMD_REGISTER_LIST = END_SLCMD_REGISTER_LIST;
const CHOOSE_BOUNTY_DIFFICULTY_DROPDOWN = [
    {
        type: 1,
        components: [
            {
                type: 3,
                placeholder: "選個難度吧！",
                custom_id: "choose_bounty_qns_difficulty",
                options: [
                    {
                        label: "簡單",
                        value: "easy"
                    },
                    {
                        label: "中等",
                        value: "medium"
                    },
                    {
                        label: "困難",
                        value: "hard"
                    }
                ],
                min_values: 1,
                max_values: 1,
                disabled: false
            }
        ]
    }
];
exports.CHOOSE_BOUNTY_DIFFICULTY_DROPDOWN = CHOOSE_BOUNTY_DIFFICULTY_DROPDOWN;
const CHOOSE_BOUNTY_ANS_DROPDOWN = [
    {
        type: 1,
        components: [
            {
                type: 3,
                placeholder: "選個答案吧！",
                custom_id: "choose_bounty_ans",
                options: [],
                min_values: 1,
                max_values: 1,
                disabled: false
            }
        ]
    }
];
exports.CHOOSE_BOUNTY_ANS_DROPDOWN = CHOOSE_BOUNTY_ANS_DROPDOWN;
