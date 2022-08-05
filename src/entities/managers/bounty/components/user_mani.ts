import { Constants, ApplicationCommandData } from 'discord.js';


export const REGISTER_LIST: ApplicationCommandData[] = [
    {
        name: 'mani-bounty-auth',
        description: '修改用戶回答懸賞題的權限',
        options: [
            {
                name: 'id',
                description: '用戶的 discord id',
                type: Constants.ApplicationCommandOptionTypes.STRING,
                required: true
            },
            {
                name: 'new-auth',
                description: '新的權限',
                type: Constants.ApplicationCommandOptionTypes.BOOLEAN,
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
                type: Constants.ApplicationCommandOptionTypes.STRING,
                required: true
            },
            {
                name: 'new-status',
                description: '新的狀態',
                type: Constants.ApplicationCommandOptionTypes.BOOLEAN,
                required: true
            }
        ]
    },
    {
        name: 'mani-bounty-stamina',
        description: '增加用戶懸賞題的體力（可為負數）',
        options: [
            {
                name: 'id',
                description: '用戶的 discord id',
                type: Constants.ApplicationCommandOptionTypes.STRING,
                required: true
            },
            {
                name: 'type',
                description: '要增加的體力種類',
                type: Constants.ApplicationCommandOptionTypes.STRING,
                choices: [
                    {
                        name: '普通',
                        value: 'regular'
                    },
                    {
                        name: '額外',
                        value: 'extra'
                    }
                ],
                required: true
            },
            {
                name: 'delta',
                description: '要增加的體力數',
                type: Constants.ApplicationCommandOptionTypes.INTEGER,
                required: true
            }
        ]
    }
]
