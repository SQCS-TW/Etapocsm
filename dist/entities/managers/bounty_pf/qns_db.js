"use strict";
// import { CommandInteraction } from 'discord.js';
// import { ObjectId } from 'mongodb';
// import { SLCMD_REGISTER_LIST } from './constants/qns_db';
// import { core, db } from '../../sc';
// class BountyQnsDBManager extends core.BaseManager {
//     constructor(father_platform: core.BasePlatform) {
//         super(father_platform);
//         this.slcmd_reglist = SLCMD_REGISTER_LIST;
//     }
//     async slcmdHandler(interaction: CommandInteraction) {
//         if (!(this.checkPerm(interaction, 'ADMINISTRATOR'))) return;
//         switch (interaction.commandName) {
//             case 'activate': {
//                 await interaction.deferReply({ ephemeral: true });
//                 for (const diffi of ['easy', 'medium', 'hard']) {
//                     const file_names = await db.getFolderFiles({
//                         bucket_name: 'bounty-questions-db',
//                         prefix: `${diffi}/`,
//                         suffixes: '.png-.jpg'
//                     });
//                     for (let i = 0; i < file_names.length; i++) {
//                         file_names[i] = file_names[i]
//                             .replace(".png", '')
//                             .replace(".jpg", '');
//                     }
//                     const cursor = await (new db.Mongo('Bounty')).getCur('Questions');
//                     for (const file_name of file_names) {
//                         const qns_data = {
//                             _id: new ObjectId(),
//                             qns_id: file_name,
//                             difficulty: diffi,
//                             choices: [],
//                             ans: [],
//                             time_avail: 150
//                         };
//                         await cursor.insertOne(qns_data);
//                     }
//                 }
//                 await interaction.editReply(':white_check_mark: 問題資料庫已建立！');
//                 break;
//             }
//             case 'modify_choices': {
//                 await interaction.deferReply({ ephemeral: true });
//                 const qns_id: string = interaction.options.getString('id');
//                 const qns_choices: Array<string> = (interaction.options.getString('choices')).split(';');
//                 const cursor = await (new db.Mongo('Bounty')).getCur('Questions');
//                 const execute = {
//                     $set: {
//                         choices: qns_choices
//                     }
//                 };
//                 await cursor.updateOne({ qns_id: qns_id }, execute);
//                 await interaction.editReply(':white_check_mark: 問題選項已修改！');
//                 break;
//             }
//             case 'modify_answers': {
//                 await interaction.deferReply({ ephemeral: true });
//                 const qns_id: string = interaction.options.getString('id');
//                 const qns_ans: Array<string> = (interaction.options.getString('ans')).split(';');
//                 const cursor = await (new db.Mongo('Bounty')).getCur('Questions');
//                 const execute = {
//                     $set: {
//                         ans: qns_ans
//                     }
//                 };
//                 await cursor.updateOne({ qns_id: qns_id }, execute);
//                 await interaction.editReply(':white_check_mark: 問題答案已修改！');
//                 break;
//             }
//         }
//     }
// }
// export {
//     BountyQnsDBManager
// };
