import { Constants, ApplicationCommandData } from 'discord.js';

const SLCMD_REGISTER_LIST: Array<ApplicationCommandData> = [
    {
        name: 'create-bounty-qns',
        description: '新增懸賞問題',
        options: [
            {
                name: 'difficulty',
                description: '難度',
                type: Constants.ApplicationCommandOptionTypes.INTEGER,
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
                type: Constants.ApplicationCommandOptionTypes.INTEGER,
                required: true
            },
            {
                name: 'correct-ans',
                description: '正確選項（用;隔開）',
                type: Constants.ApplicationCommandOptionTypes.STRING,
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
                type: Constants.ApplicationCommandOptionTypes.STRING,
                required: true
            },
            {
                name: 'max-choices',
                description: '新的總選項個數',
                type: Constants.ApplicationCommandOptionTypes.INTEGER,
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
                type: Constants.ApplicationCommandOptionTypes.STRING,
                required: true
            },
            {
                name: 'ans',
                description: '問題所有答案（用;隔開）',
                type: Constants.ApplicationCommandOptionTypes.STRING,
                required: true
            }
        ]
    }
];

export {
    SLCMD_REGISTER_LIST
}