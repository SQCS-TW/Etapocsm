"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmStartBountyManager = void 0;
const shortcut_1 = require("../../../shortcut");
const fs_1 = require("fs");
const discord_js_1 = require("discord.js");
const components_1 = require("./components");
class BountyQnsPicCacheHandler {
    constructor() {
        this.cache = new shortcut_1.db.Redis();
        this.diffi_cache_cd = {
            'easy': 10,
            'medium': 5,
            'hard': 3
        };
    }
    switchThread(thread) {
        return (thread + 1) % 2;
    }
    async clearAllCache() {
        const all_keys = await this.cache.client.KEYS('bountyPicCache*');
        await shortcut_1.core.asyncForEach(all_keys, async (key) => {
            await this.cache.client.DEL(key);
        });
        const file_names = (0, fs_1.readdirSync)(`./cache/bounty_qns_pic/`);
        file_names.forEach(file_name => {
            (0, fs_1.unlink)(`./cache/bounty_qns_pic/${file_name}`, () => { return; });
        });
    }
    async getOrSetCache(qns_diffi, qns_number) {
        const path_suffix = `${qns_diffi}_${qns_number}`;
        const pic_cache_key = `bountyPicCache?suffix=${path_suffix}`;
        const pic_data = JSON.parse(await this.cache.client.GET(pic_cache_key));
        if (pic_data?.cd > 0) {
            pic_data.cd--;
            await this.cache.client.SET(pic_cache_key, JSON.stringify(pic_data));
            return {
                exists: true,
                full_file_path: `${pic_data.thread}_${path_suffix}`
            };
        }
        else if (pic_data?.cd === 0) {
            const old_thread = pic_data.thread;
            pic_data.thread = this.switchThread(pic_data.thread);
            pic_data.cd = this.diffi_cache_cd[qns_diffi];
            await this.cache.client.SET(pic_cache_key, JSON.stringify(pic_data));
            (0, fs_1.unlink)(`./cache/bounty_qns_pic/${old_thread}_${path_suffix}.png`, () => { return; });
            return {
                exists: false,
                full_file_path: `${pic_data.thread}_${path_suffix}`
            };
        }
        else if (!pic_data) {
            const pic_data = {
                thread: 0,
                cd: this.diffi_cache_cd[qns_diffi]
            };
            await this.cache.client.SET(pic_cache_key, JSON.stringify(pic_data));
            return {
                exists: false,
                full_file_path: `0_${path_suffix}`
            };
        }
    }
}
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
        this.pic_cache_hdl = new BountyQnsPicCacheHandler();
        this.qns_diffi_time = {
            'easy': 60,
            'medium': 60 * 2,
            'hard': 60 * 3
        };
        this.setupListener();
    }
    setupListener() {
        this.f_platform.f_bot.on('ready', async () => {
            await this.pic_cache_hdl.cache.client.connect();
            await this.pic_cache_hdl.clearAllCache();
        });
        this.f_platform.f_bot.on('interactionCreate', async (interaction) => {
            if (interaction.isButton())
                await this.buttonHandler(interaction);
        });
    }
    async buttonHandler(interaction) {
        if (interaction.customId !== 'confirm-start-bounty')
            return;
        await interaction.deferReply();
        const delete_result = await (await this.confirm_start_button_op.cursor).findOneAndDelete({ user_id: interaction.user.id });
        if (!delete_result.ok)
            return await interaction.editReply('刪除驗證資訊時發生錯誤！');
        const user_btn_data = delete_result.value;
        if (!user_btn_data)
            return await interaction.editReply('抱歉，我們找不到你的驗證資訊...');
        else if (user_btn_data.msg_id !== interaction.message.id)
            return await interaction.editReply('抱歉，請確認你按下的按鈕是否正確...');
        const ongoing_data = await (await this.ongoing_op.cursor).findOne({ user_id: interaction.user.id });
        let takeaway_stamina;
        if (ongoing_data.stamina.regular > 0) {
            takeaway_stamina = {
                $inc: {
                    "stamina.regular": -1
                }
            };
        }
        else if (ongoing_data.stamina.extra > 0) {
            takeaway_stamina = {
                $inc: {
                    "stamina.extra": -1
                }
            };
        }
        const takeaway_result = await (await this.ongoing_op.cursor).updateOne({ user_id: interaction.user.id }, takeaway_stamina);
        if (!takeaway_result.acknowledged)
            return await interaction.editReply('抱歉，消耗體力時發生錯誤了...');
        const update_result = await this.ongoing_op.setStatus(interaction.user.id, true);
        if (update_result.status === shortcut_1.db.StatusCode.WRITE_DATA_ERROR)
            return await interaction.user.send('抱歉，開始懸賞時發生錯誤了...');
        const qns_diffi = user_btn_data.qns_info.difficulty;
        const qns_number = user_btn_data.qns_info.number;
        const new_button = await shortcut_1.core.discord.getDisabledButton(components_1.default_start_button);
        if (interaction.message instanceof discord_js_1.Message)
            await interaction.message.edit({
                components: shortcut_1.core.discord.compAdder([
                    [new_button]
                ])
            });
        const pic_dl_time = 10;
        const buffer_time = 1;
        const start_time = shortcut_1.core.timeAfterSecs(buffer_time + pic_dl_time);
        const end_time = shortcut_1.core.timeAfterSecs(this.qns_diffi_time[qns_diffi] + pic_dl_time + buffer_time);
        const ans_time_embed = await this.getAnsweringTimeEmbed(shortcut_1.core.discord.getRelativeTimestamp(start_time), shortcut_1.core.discord.getRelativeTimestamp(end_time));
        await interaction.editReply({
            embeds: [ans_time_embed]
        });
        const pic_cache_data = await this.pic_cache_hdl.getOrSetCache(qns_diffi, qns_number);
        const local_file_path = `./cache/bounty_qns_pic/${pic_cache_data.full_file_path}.png`;
        const async_tasks = [shortcut_1.core.sleep(pic_dl_time)];
        if (!pic_cache_data.exists)
            async_tasks.push(shortcut_1.db.storjDownload({
                bucket_name: 'bounty-questions-db',
                local_file_name: local_file_path,
                db_file_name: `${qns_diffi}/${qns_number}.png`
            }));
        await Promise.all(async_tasks);
        if (!(0, fs_1.existsSync)(local_file_path))
            return await interaction.followUp('下載圖片錯誤！');
        const end_btn_info = {
            user_id: interaction.user.id,
            time: {
                start: start_time,
                end: end_time
            }
        };
        const create_result = await (await this.end_button_op.cursor).insertOne(end_btn_info);
        if (!create_result.acknowledged)
            return await interaction.user.send('創建驗證資訊時發生錯誤...');
        const qns_msg = await interaction.user.send({
            embeds: [components_1.default_qns_info_embed],
            files: [local_file_path],
            components: shortcut_1.core.discord.compAdder([
                [components_1.default_end_button, components_1.default_destroy_qns_button]
            ])
        });
        const update_qns_msg_id = {
            $set: {
                qns_msg_id: qns_msg.id
            }
        };
        await (await this.ongoing_op.cursor).updateOne({ user_id: interaction.user.id }, update_qns_msg_id);
    }
    async getAnsweringTimeEmbed(start_time, end_time) {
        const new_embed = new discord_js_1.MessageEmbed(components_1.default_answering_info_embed);
        new_embed.addField('⏳ 開始時間', start_time, true);
        new_embed.addField('⌛ 結束時間', end_time, true);
        return new_embed;
    }
}
exports.ConfirmStartBountyManager = ConfirmStartBountyManager;
