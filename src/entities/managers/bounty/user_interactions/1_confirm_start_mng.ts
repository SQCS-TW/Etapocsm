import { core, db } from '../../../shortcut';
import { unlink, existsSync } from 'fs';
import { ObjectId } from 'mongodb';

import {
    ButtonInteraction,
    Message,
    MessageEmbed
} from 'discord.js';

import {
    default_start_button,
    default_end_button,
    default_answering_info_embed,
    default_destroy_qns_button,
    default_qns_info_embed
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

        const user_btn_data = await (await this.confirm_start_button_op.cursor).findOne({ user_id: interaction.user.id });
        if (!user_btn_data) return await interaction.editReply('抱歉，我們找不到你的驗證資訊...');
        else if (user_btn_data.msg_id !== interaction.message.id) return await interaction.editReply('抱歉，請確認你按下的按鈕是否正確...');

        const ongoing_data = await (await this.ongoing_op.cursor).findOne({ user_id: interaction.user.id });

        let takeaway_stamina: object;
        if (ongoing_data.stamina.regular > 0) {
            takeaway_stamina = {
                $inc: {
                    "stamina.regular": -1
                }
            }
        } else if (ongoing_data.stamina.extra > 0) {
            takeaway_stamina = {
                $inc: {
                    "stamina.extra": -1
                }
            }
        }
        const takeaway_result = await (await this.ongoing_op.cursor).updateOne({ user_id: interaction.user.id }, takeaway_stamina);
        if (!takeaway_result.acknowledged) return await interaction.editReply('抱歉，消耗體力時發生錯誤了...');

        // activate user ongoing status
        const update_result = await this.ongoing_op.setStatus(interaction.user.id, true);
        if (update_result.status === db.StatusCode.WRITE_DATA_ERROR) return await interaction.user.send('抱歉，開始懸賞時發生錯誤了...');
        //

        const qns_diffi = user_btn_data.qns_info.difficulty;
        const qns_number = user_btn_data.qns_info.number;

        // disabled the button after activating user status
        const new_button = await core.discord.getDisabledButton(default_start_button);
        if (interaction.message instanceof Message) await interaction.message.edit({
            components: core.discord.compAdder([
                [new_button]
            ])
        });
        //

        const delete_result = await (await this.confirm_start_button_op.cursor).deleteOne({ user_id: interaction.user.id });
        if (!delete_result.acknowledged) return await interaction.editReply('刪除驗證資訊時發生錯誤！');


        // start handling qns-pic
        const pic_dl_time = 10;
        const buffer_time = 1;

        const start_time = core.timeAfterSecs(buffer_time + pic_dl_time);
        const end_time = core.timeAfterSecs(this.qns_diffi_time[qns_diffi] + pic_dl_time + buffer_time);

        const ans_time_embed = await this.getAnsweringTimeEmbed(
            core.discord.getRelativeTimestamp(start_time),
            core.discord.getRelativeTimestamp(end_time)
        );
        await interaction.editReply({
            embeds: [ans_time_embed]
        });

        const local_file_name = `./cache/qns_pic_dl/${interaction.user.id}.png`;
        const async_tasks = [
            core.sleep(pic_dl_time),
            db.storjDownload({
                bucket_name: 'bounty-questions-db',
                local_file_name: local_file_name,
                db_file_name: `${qns_diffi}/${qns_number}.png`
            })
        ];

        await Promise.all(async_tasks);
        if (!existsSync(local_file_name)) return await interaction.followUp('下載圖片錯誤！');

        const qns_msg = await interaction.user.send({
            embeds: [default_qns_info_embed],
            files: [local_file_name],
            components: core.discord.compAdder([
                [default_end_button, default_destroy_qns_button]
            ])
        });
        unlink(local_file_name, () => { return; });

        // set msg_id to user ongoing data
        const update_qns_msg_id = {
            $set: {
                qns_msg_id: qns_msg.id
            }
        };
        await (await this.ongoing_op.cursor).updateOne({ user_id: interaction.user.id }, update_qns_msg_id);

        const end_btn_info = {
            _id: new ObjectId(),
            user_id: interaction.user.id,
            time: {
                start: start_time,
                end: end_time
            }
        };
        const create_result = await (await this.end_button_op.cursor).insertOne(end_btn_info);
        if (!create_result.acknowledged) return await interaction.user.send('建立結束資料時發生錯誤！');
    }

    private async getAnsweringTimeEmbed(start_time: string, end_time: string) {
        const new_embed = new MessageEmbed(default_answering_info_embed);
        new_embed.addField('⏳ 開始時間', start_time, true);
        new_embed.addField('⌛ 結束時間', end_time, true);
        return new_embed;
    }
}
