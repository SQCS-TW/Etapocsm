import {
    MessageButton,
    MessageEmbed,
    MessageSelectMenu
} from 'discord.js';

export const default_start_button = new MessageButton()
    .setStyle('PRIMARY')
    .setLabel('確認開始答題')
    .setCustomId('confirm-start-bounty')

export const default_start_embed = new MessageEmbed()
    .setTitle('題目資訊')
    .setColor('#ffffff')
    .setFooter({
        text: '題目將在確認之後發送；確認按鈕將在60秒後過期；如不答題不用按按鈕'
    });

export const default_answering_info_embed = new MessageEmbed()
    .setTitle('答題資訊')
    .setColor('#ffffff')
    .setFooter({
        text: '如要答題，請在結束時間抵達前按下按鈕'
    });

export const default_end_button = new MessageButton()
    .setStyle('SUCCESS')
    .setLabel('結束答題')
    .setCustomId('end-bounty');

export const default_select_ans_dropdown = new MessageSelectMenu()
    .setCustomId('choose-bounty-answers')
    .setPlaceholder('選擇答案')
    .setMinValues(1)
    .setMaxValues(1);
