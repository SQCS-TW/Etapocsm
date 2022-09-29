import { ApplicationCommandData, MessageEmbed } from 'discord.js';

export const SLCMD_REGISTER_LIST: ApplicationCommandData[] = [
    {
        name: 'create-ama-reaction-exp-event',
        description: '新增AMA經驗值掉寶活動'
    }
];

export const REACTION_EXP_EMBED = new MessageEmbed()
    .setTitle('✨｜AMA經驗值掉寶活動')
    .setColor('#ffffff');
