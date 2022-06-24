"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default_select_ans_dropdown = exports.default_destroy_qns_button = exports.default_end_button = exports.default_answering_info_embed = exports.default_start_embed = exports.default_start_button = void 0;
const discord_js_1 = require("discord.js");
exports.default_start_button = new discord_js_1.MessageButton()
    .setStyle('PRIMARY')
    .setLabel('✅確認開始答題')
    .setCustomId('confirm-start-bounty');
exports.default_start_embed = new discord_js_1.MessageEmbed()
    .setTitle('題目資訊')
    .setColor('#ffffff')
    .setFooter({
    text: '題目將在確認之後發送；確認按鈕將在60秒後過期；如不答題不用按按鈕'
});
exports.default_answering_info_embed = new discord_js_1.MessageEmbed()
    .setTitle('答題資訊')
    .setColor('#ffffff')
    .setFooter({
    text: '如要答題，請在結束時間抵達前按下按鈕'
});
exports.default_end_button = new discord_js_1.MessageButton()
    .setStyle('SUCCESS')
    .setLabel('🚩結束答題')
    .setCustomId('end-bounty');
exports.default_destroy_qns_button = new discord_js_1.MessageButton()
    .setStyle('DANGER')
    .setLabel('⚠️ 銷毀題目')
    .setCustomId('destroy-bounty-qns');
exports.default_select_ans_dropdown = new discord_js_1.MessageSelectMenu()
    .setCustomId('choose-bounty-answers')
    .setPlaceholder('👉選擇答案')
    .setMinValues(1)
    .setMaxValues(1);
