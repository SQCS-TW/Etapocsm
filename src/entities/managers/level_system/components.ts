import { ApplicationCommandData } from 'discord.js';

export const REGISTER_LIST: Array<ApplicationCommandData> = [
    {
        name: 'check-lvl-data',
        description: '查看個人等級資訊',
    },
    {
        name: 'check-lvl-rank',
        description: '列出總經驗值前十排行榜'
    }
];
