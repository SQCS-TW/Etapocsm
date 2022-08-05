import { ApplicationCommandData, Constants } from 'discord.js';

export const USER_INTERACTION_SLCMD_REGISTER_LIST: ApplicationCommandData[] = [
    {
        name: 'check-lvl-data',
        description: '查看個人等級資訊',
    },
    {
        name: 'check-lvl-rank',
        description: '列出總經驗值前十排行榜'
    }
];

export const USER_MANI_SLCMD_REGISTER_LIST: ApplicationCommandData[] = [
    {
        name: 'mani-exp-multiplier',
        description: '修改用戶經驗倍數',
        options: [
            {
                name: 'id',
                description: '用戶的 discord id',
                type: Constants.ApplicationCommandOptionTypes.STRING,
                required: true
            },
            {
                name: 'new-multiplier',
                description: '新的經驗倍數，取值到小數點後第一位',
                type: Constants.ApplicationCommandOptionTypes.NUMBER,
                required: true
            }
        ]
    }
];
