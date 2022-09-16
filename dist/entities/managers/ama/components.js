"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REACTION_EXP_EMBED = exports.SLCMD_REGISTER_LIST = void 0;
const discord_js_1 = require("discord.js");
exports.SLCMD_REGISTER_LIST = [
    {
        name: 'create-ama-reaction-exp-event',
        description: '新增AMA經驗值掉寶活動',
        options: [
            {
                name: 'exp',
                description: '經驗值掉寶數（大於等於5，小於等於10）',
                type: discord_js_1.Constants.ApplicationCommandOptionTypes.INTEGER,
                required: true
            }
        ]
    }
];
exports.REACTION_EXP_EMBED = new discord_js_1.MessageEmbed()
    .setTitle('✨｜AMA經驗值掉寶活動')
    .setColor('#ffffff');
