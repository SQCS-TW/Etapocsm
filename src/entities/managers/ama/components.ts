import { Constants, ApplicationCommandData, MessageEmbed } from 'discord.js';

export const SLCMD_REGISTER_LIST: ApplicationCommandData[] = [
    {
        name: 'create-ama-reaction-exp-event',
        description: '新增AMA經驗值掉寶活動',
        options: [
            {
                name: 'exp',
                description: '經驗值掉寶數（大於等於5，小於等於10）',
                type: Constants.ApplicationCommandOptionTypes.INTEGER,
                required: true
            }
        ]
    }
];


export const REACTION_EXP_EMBED = new MessageEmbed()
    .setTitle('✨｜AMA經驗值掉寶活動')
    .setColor('#ffffff');
