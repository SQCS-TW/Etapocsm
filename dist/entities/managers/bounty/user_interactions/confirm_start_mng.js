"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmStartBountyManager = void 0;
const shortcut_1 = require("../../../shortcut");
const fs_1 = require("fs");
const mongodb_1 = require("mongodb");
const discord_js_1 = require("discord.js");
const components_1 = require("./components");
class ConfirmStartBountyManager extends shortcut_1.core.BaseManager {
    constructor(f_platform) {
        super(f_platform);
        this.ongoing_op = new shortcut_1.core.BountyUserOngoingInfoOperator();
        this.confirm_start_button_op = new shortcut_1.core.BaseMongoOperator({
            db: 'Bounty',
            coll: 'StartButtonPipeline'
        });
        this.end_button_op = new shortcut_1.core.BaseMongoOperator({
            db: 'Bounty',
            coll: 'EndButtonPipeline'
        });
        this.qns_diffi_time = {
            'easy': 60,
            'medium': 60 * 2,
            'hard': 60 * 3
        };
        this.setupListener();
    }
    setupListener() {
        this.f_platform.f_bot.on('interactionCreate', async (interaction) => {
            if (interaction.isButton())
                await this.buttonHandler(interaction);
        });
    }
    async buttonHandler(interaction) {
        if (interaction.customId !== 'confirm-start-bounty')
            return;
        await interaction.deferReply();
        const user_btn_data = await (await this.confirm_start_button_op.cursor_promise).findOne({ user_id: interaction.user.id });
        if (!user_btn_data)
            return await interaction.editReply('錯誤，找不到驗證資訊');
        else if (user_btn_data.msg_id !== interaction.message.id)
            return await interaction.editReply('驗證資訊錯誤');
        const ongoing_data = await (await this.ongoing_op.cursor_promise).findOne({ user_id: interaction.user.id });
        // take stamina from user
        let stamina_execute;
        if (ongoing_data.stamina.regular > 0) {
            stamina_execute = {
                $inc: {
                    "stamina.regular": -1
                }
            };
        }
        else if (ongoing_data.stamina.extra > 0) {
            stamina_execute = {
                $inc: {
                    "stamina.extra": -1
                }
            };
        }
        await (await this.ongoing_op.cursor_promise).updateOne({ user_id: interaction.user.id }, stamina_execute);
        //
        // activate user ongoing status
        const update_result = await this.ongoing_op.setStatus(interaction.user.id, true);
        if (update_result.status === shortcut_1.db.StatusCode.WRITE_DATA_ERROR)
            return await interaction.user.send('開始懸賞時發生錯誤！');
        //
        const diffi = user_btn_data.qns_info.difficulty;
        const qns_number = user_btn_data.qns_info.number;
        const new_button = await shortcut_1.core.discord.getDisabledButton(components_1.default_start_button);
        const msg = interaction.message;
        await msg.edit({
            components: shortcut_1.core.discord.compAdder([
                [new_button]
            ])
        });
        const delete_result = await (await this.confirm_start_button_op.cursor_promise).deleteOne({ user_id: interaction.user.id });
        if (!delete_result.acknowledged)
            return await interaction.editReply('刪除驗證資訊時發生錯誤！');
        const buffer_time = 10;
        const process_delay_time = 1;
        const start_time = Date.now() + (buffer_time + process_delay_time) * 1000;
        const end_time = Date.now() + (this.qns_diffi_time[diffi] + buffer_time + process_delay_time) * 1000;
        const answering_embed = await this.getAnsweringInfoEmbed(shortcut_1.core.discord.getRelativeTimestamp(start_time), shortcut_1.core.discord.getRelativeTimestamp(end_time));
        await interaction.editReply({
            embeds: [answering_embed]
        });
        const local_file_name = `./cache/qns_pic_dl/${interaction.user.id}.png`;
        const async_tasks = [
            shortcut_1.core.sleep(buffer_time),
            shortcut_1.db.storjDownload({
                bucket_name: 'bounty-questions-db',
                local_file_name: local_file_name,
                db_file_name: `${diffi}/${qns_number}.png`
            })
        ];
        await Promise.all(async_tasks);
        if (!(0, fs_1.existsSync)(local_file_name))
            return await interaction.editReply('下載圖片錯誤！');
        const qns_msg = await interaction.user.send({
            embeds: [components_1.default_qns_info_embed],
            files: [local_file_name],
            components: shortcut_1.core.discord.compAdder([
                [components_1.default_end_button, components_1.default_destroy_qns_button]
            ])
        });
        (0, fs_1.unlink)(local_file_name, () => { return; });
        const end_btn_info = {
            _id: new mongodb_1.ObjectId(),
            user_id: interaction.user.id,
            channel_id: interaction.channelId,
            msg_id: qns_msg.id,
            time: {
                start: start_time,
                end: end_time
            }
        };
        const create_result = await (await this.end_button_op.cursor_promise).insertOne(end_btn_info);
        if (!create_result.acknowledged)
            await interaction.user.send('建立結束資料時發生錯誤！');
    }
    async getAnsweringInfoEmbed(start_time, end_time) {
        const new_embed = new discord_js_1.MessageEmbed(components_1.default_answering_info_embed);
        new_embed.addField('⏳ 開始時間', start_time, true);
        new_embed.addField('⌛ 結束時間', end_time, true);
        return new_embed;
    }
}
exports.ConfirmStartBountyManager = ConfirmStartBountyManager;
