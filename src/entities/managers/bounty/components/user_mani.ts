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
    }
]
