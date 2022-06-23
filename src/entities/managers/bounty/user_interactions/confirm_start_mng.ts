import { core, db } from '../../../shortcut';
import { unlink, existsSync } from 'fs';
import { ObjectId } from 'mongodb';

import {
    ButtonInteraction,
    MessageEmbed
} from 'discord.js';

import {
    default_start_button,
    default_end_button,
    default_answering_info_embed
} from './components';

export class ConfirmStartBountyManager extends core.BaseManager {
    private ongoing_op = new core.BountyUserOngoingInfoOperator();

    private confirm_start_button_op = new core.BaseMongoOperator({
        db: 'Bounty',
        coll: 'StartButtonPipeline'
    });

    private end_button_op = new core.BaseMongoOperator({
        db: 'Bounty',
        coll: 'EndButtonPipeline'
    });

    private qns_diffi_time = {
        'easy': 60,
        'medium': 60 * 2,
        'hard': 60 * 3
    };

    constructor(f_platform: core.BasePlatform) {
        super(f_platform);

        this.setupListener();
    }

    private setupListener() {
        this.f_platform.f_bot.on('interactionCreate', async (interaction) => {
            if (interaction.isButton()) await this.buttonHandler(interaction);
        });
    }

    private async buttonHandler(interaction: ButtonInteraction) {
        if (interaction.customId !== 'confirm-start-bounty') return;

        await interaction.deferReply();

        const user_btn_data = await (await this.confirm_start_button_op.cursor_promise).findOne({ user_id: interaction.user.id });
        if (!user_btn_data) return await interaction.editReply('錯誤，找不到驗證資訊');
        else if (user_btn_data.msg_id !== interaction.message.id) return await interaction.editReply('驗證資訊錯誤');

        const ongoing_data = await (await this.ongoing_op.cursor_promise).findOne({ user_id: interaction.user.id });

        let stamina_execute: object;
        if (ongoing_data.stamina.regular > 0) {
            stamina_execute = {
                $inc: {
                    "stamina.regular": -1
                }
            }
        } else if (ongoing_data.stamina.extra > 0) {
            stamina_execute = {
                $inc: {
                    "stamina.extra": -1
                }
            }
        } else {
            return await interaction.editReply('錯誤，你沒有足夠的體力！');
        }
        await (await this.ongoing_op.cursor_promise).updateOne({ user_id: interaction.user.id }, stamina_execute);

        const diffi = user_btn_data.qns_info.difficulty;
        const qns_number = user_btn_data.qns_info.number;

        const new_button = await core.discord.getDisabledButton(default_start_button);

        const msg: any = interaction.message;
        await msg.edit({
            components: core.discord.compAdder([
                [new_button]
            ])
        });

        const delete_result = await (await this.confirm_start_button_op.cursor_promise).deleteOne({ user_id: interaction.user.id });
        if (!delete_result.acknowledged) return await interaction.editReply('刪除驗證資訊時發生錯誤！');

        const buffer_time = 10;
        const process_delay_time = 1;

        const start_time = Date.now() + (buffer_time + process_delay_time) * 1000;
        const end_time = Date.now() + (this.qns_diffi_time[diffi] + buffer_time + process_delay_time) * 1000;

        const execute = {
            $set: {
                status: true
            }
        }
        const update_result = await (await this.ongoing_op.cursor_promise).updateOne({ user_id: interaction.user.id }, execute);
        if (!update_result.acknowledged) return await interaction.user.send('開始懸賞時發生錯誤！');

        const answering_embed = await this.getAnsweringInfoEmbed(
            core.discord.getRelativeTimestamp(start_time),
            core.discord.getRelativeTimestamp(end_time)
        );

        await interaction.editReply({
            embeds: [answering_embed]
        });

        const local_file_name = `./cache/qns_pic_dl/${interaction.user.id}.png`;
        const async_tasks = [
            core.sleep(buffer_time),
            db.storjDownload({
                bucket_name: 'bounty-questions-db',
                local_file_name: local_file_name,
                db_file_name: `${diffi}/${qns_number}.png`
            })
        ];

        await Promise.all(async_tasks);
        if (!existsSync(local_file_name)) return await interaction.editReply('下載圖片錯誤！');

        const qns_msg = await interaction.user.send({
            content: '**【題目】**注意，請勿將題目外流給他人，且答題過後建議銷毀。',
            files: [local_file_name],
            components: core.discord.compAdder([
                [default_end_button]
            ])
        });
        unlink(local_file_name, () => { return; });

        const end_btn_info = {
            _id: new ObjectId(),
            user_id: interaction.user.id,
            channel_id: interaction.channelId,
            msg_id: qns_msg.id,
            time: {
                start: start_time,
                end: end_time
            }
        }
        const create_result = await (await this.end_button_op.cursor_promise).insertOne(end_btn_info);
        if (!create_result.acknowledged) await interaction.user.send('建立結束資料時發生錯誤！');
    }

    private async getAnsweringInfoEmbed(start_time: string, end_time: string) {
        const new_embed = new MessageEmbed(default_answering_info_embed);
        new_embed.addField('開始時間', start_time, true);
        new_embed.addField('結束時間', end_time, true);
        return new_embed;
    }
}
