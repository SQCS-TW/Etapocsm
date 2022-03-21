import { ApplicationCommandData, Constants } from 'discord.js';

const SLCMD_REGISTER_LIST: Array<ApplicationCommandData> = [
    {
        name: 'activate_bounty',
        description: '開始懸賞活動'
    },
    {
        name: 'end_bounty',
        description: '結束懸賞活動（回答問題）'
    },
    {
        name: 'set_status',
        description: '設定用戶狀態',
        options: [
            {
                name: 'user_id',
                description: '用戶id',
                type: Constants.ApplicationCommandOptionTypes.STRING,
                required: true
            },
            {
                name: 'status',
                description: '新的用戶狀態',
                type: Constants.ApplicationCommandOptionTypes.BOOLEAN,
                required: true
            }
        ]
    }
];

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

export {
    SLCMD_REGISTER_LIST,
    CHOOSE_BOUNTY_DIFFICULTY_DROPDOWN,
    CHOOSE_BOUNTY_ANS_DROPDOWN
};