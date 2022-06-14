"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.END_BOUNTY_COMPONENTS = exports.START_BOUNTY_COMPONENTS = exports.EVENT_MANAGER_SLCMD = exports.ACCOUNT_MANAGER_SLCMD = void 0;
exports.ACCOUNT_MANAGER_SLCMD = [
    {
        name: 'create-main-bounty-account',
        description: '建立自己的懸賞區主帳號'
    },
    {
        name: 'check-main-bounty-account',
        description: '查看自己的懸賞區主帳號'
    },
    {
        name: 'check-bounty-ongoing-info',
        description: '查看自己懸賞區目前的闖關狀態'
    }
];
exports.EVENT_MANAGER_SLCMD = [
    {
        name: 'start-bounty',
        description: '開始挑戰懸賞題'
    },
    {
        name: 'end-bounty',
        description: '結束並回答懸賞題'
    }
];
exports.START_BOUNTY_COMPONENTS = {
    button: {
        type: 1,
        components: [
            {
                style: 1,
                label: '開始答題',
                custom_id: `start_bounty`,
                disabled: false,
                type: 2
            }
        ]
    },
    embed: {
        type: "rich",
        title: '題目資訊',
        description: "",
        color: 0x00FFFF,
        fields: [
            {
                name: '題目難度',
                value: 'diffi',
                inline: true
            },
            {
                name: `題目編號`,
                value: 'qns_number',
                inline: true
            }
        ],
        footer: {
            text: '題目將在確認之後發送；確認按鈕將在60秒後過期。'
        }
    }
};
exports.END_BOUNTY_COMPONENTS = {
    button: {
        type: 1,
        components: [
            {
                style: 3,
                label: '結束答題',
                custom_id: 'end_bounty',
                disabled: false,
                type: 2
            }
        ]
    },
    embed: {
        type: "rich",
        title: '答題資訊',
        description: "",
        color: 0xff9500,
        fields: [
            {
                name: '開始時間',
                value: 'time.start',
                inline: true
            },
            {
                name: '結束時間',
                value: 'time.end',
                inline: true
            }
        ],
        footer: {
            text: '如要答題，請在結束時間抵達前按下按鈕。'
        }
    }
};
