import { CogExtension, MainGuildConfig } from '../../core/cog_config';
import { bot } from '../../index';
import { interactionChecker } from './verify';
import { Mongo, MongoDataInterface } from '../../core/db/mongodb';
import { storjDownload, getFolderFiles } from '../../core/db/storj/ts_port';
import fs from 'fs';
import { timeAfterSecs, getRandomInt, verifyMenuApplication } from '../../core/utils';
import { CommandInteraction, SelectMenuInteraction, ApplicationCommandData, Client } from 'discord.js'
import { Collection, ObjectId } from 'mongodb';


class BountyManager extends CogExtension {
    slCmdRegister() {
        const cmd_register_list: Array<ApplicationCommandData> = [
            {
                name: 'activate_bounty',
                description: '開始懸賞活動'
            }
        ];

        (new MainGuildConfig(this.bot)).slCmdCreater(cmd_register_list);
    };

    async slCmdHandler(interaction: CommandInteraction) {
        if (!this.in_use) return;

        // only receive messages from the bounty-use channel
        // currently use cmd-use channel for testing
        if (interaction.channel.id !== '743677861000380527') return;

        switch (interaction.commandName) {
            case 'activate_bounty': {
                await interaction.deferReply({ ephemeral: true });

                // check if the user is already answering questions:
                const account_cursor = await (new Mongo('Bounty')).getCur('Accounts');
                const user_data = await account_cursor.findOne({ _id: interaction.user.id });

                if (user_data && user_data.active) {
                    await interaction.editReply({
                        content: ':x:**【啟動錯誤】**你已經在回答問題中了！'
                    });
                    return;
                };
                //

                const cursor = await (new Mongo('Interaction')).getCur('Pipeline');

                // avoid redundant application
                const redundant_data = await cursor.findOne(
                    {
                        user_id: interaction.user.id,
                        type: 'choose_bounty_qns_difficulty',
                    }
                );

                if (redundant_data) {
                    await interaction.editReply({
                        content: ':x:**【申請錯誤】**請勿重複申請！'
                    });
                    return;
                };
                //

                let account_status = await (new bountyAccountManager(interaction.user.id)).checkAccount();
                if (!account_status) {
                    await interaction.editReply({
                        content: ':x:**【帳號 創建/登入 錯誤】**請洽總召！'
                    });
                    return;
                };

                await interaction.editReply({
                    content: ':white_check_mark:**【帳號檢查完畢】**活動開始！'
                });

                await interaction.followUp({
                    content: '請選擇問題難度（限時 15 秒）',
                    components: this.bounty_qns_difficulty_dropdown,
                    ephemeral: true
                });

                const player_application: MongoDataInterface = {
                    _id: new ObjectId(),
                    user_id: interaction.user.id,
                    type: 'choose_bounty_qns_difficulty',
                    due_time: (await timeAfterSecs(15))
                };

                const apply_result = await cursor.insertOne(player_application);
                if (!apply_result.acknowledged) {
                    await interaction.followUp({
                        content: ':x:**【選單申請創建錯誤】**請洽總召！',
                        files: this.error_gif,
                        ephemeral: true
                    });

                    return;
                };

                break;
            };
        };
    };


    bounty_qns_difficulty_dropdown = [
        {
            type: 1,
            components: [
                {
                    type: 3,
                    placeholder: "選個難度吧！",
                    custom_id: "choose_bounty_qns_difficulty",
                    options: [
                        {
                            label: "簡單",
                            value: "easy"
                        },
                        {
                            label: "中等",
                            value: "medium"
                        },
                        {
                            label: "困難",
                            value: "hard"
                        }
                    ],
                    min_values: 1,
                    max_values: 1,
                    disabled: false
                }
            ]
        }
    ];

    async dropdownHandler(interaction: SelectMenuInteraction) {
        if (!this.in_use) return;

        // only receive messages from the bounty-use channel
        // currently use cmd-use channel for testing
        if (interaction.channel.id !== '743677861000380527') return;

        switch (interaction.customId) {
            case 'choose_bounty_qns_difficulty': {
                await interaction.deferReply({ ephemeral: true });

                // check if there's exists such an application:
                const verify = {
                    _id: new ObjectId(),
                    user_id: interaction.user.id,
                    type: "choose_bounty_qns_difficulty"
                };
                if (!(await verifyMenuApplication(verify))) {
                    await interaction.editReply({
                        content: ':x:**【選單認證錯誤】**選單已經逾期；或是請勿重複選擇。',
                        files: this.error_gif
                    });
                    return;
                };
                //

                // fetch qns picture:
                // comes in forms of 'easy', 'medium', 'hard'
                const diffi = interaction.values[0];

                const dl_result = await this.downloadQnsPicture(diffi);
                if (!dl_result.result) {
                    await interaction.followUp({
                        content: ':x:**【題目獲取錯誤】**請洽總召！',
                        files: this.error_gif,
                        ephemeral: true
                    });
                    return;
                };
                //

                // send picture and delete local picture:
                await interaction.followUp({
                    content: '**【題目】**注意，請將題目存起來，這則訊息將在一段時間後消失。\n但請勿將題目外流給他人，且答題過後建議銷毀。',
                    files: [dl_result.local_file_name],
                    ephemeral: true
                });

                fs.unlink(dl_result.local_file_name, () => { });
                //

                const append_result = await this.appendToPipeline(diffi, dl_result.random_filename, interaction.user.id);
                if (!append_result.result) {
                    await interaction.followUp(append_result.message);
                    return;
                }

                const active_result = await this.activePayerStatus(interaction.user.id);
                if (!active_result.result) {
                    await interaction.followUp(active_result.message);
                    return;
                }

                break;
            };
        };
    };

    async downloadQnsPicture(diffi) {
        const files = await getFolderFiles({
            bucket_name: 'bounty-questions-db',
            prefix: `${diffi}/`,
            suffixes: '.png-.jpg'
        });
        console.log(files);
        const random_filename = files[await getRandomInt(files.length)];
        const local_file_name = `./assets/buffer/storj/${random_filename}`;

        let result = await storjDownload({
            bucket_name: 'bounty-questions-db',
            local_file_name: local_file_name,
            db_file_name: `${diffi}/${random_filename}`
        });

        return {
            result: result,
            random_filename: random_filename,
            local_file_name: local_file_name
        };
    };

    async appendToPipeline(diffi, random_filename, player_id) {
        const qns_cursor = await (new Mongo('Bounty')).getCur('Questions');

        const qns_id = random_filename
            .replace(".png", '')
            .replace(".jpg", '');

        const qns_data = await qns_cursor.findOne({ qns_id: qns_id });

        const player_data = {
            _id: new ObjectId(),
            user_id: player_id,
            difficulty: diffi,
            qns_id: qns_id,
            due_time: await timeAfterSecs(qns_data.time_avail)
        };

        const pipeline_cursor = (new Mongo('Bounty')).getCur('OngoingPipeline');
        const ongoing_data_insert_result = await (await pipeline_cursor).insertOne(player_data);

        if (!ongoing_data_insert_result.acknowledged) {
            return {
                result: false,
                message: {
                    content: ':x:**【活動檔案建立錯誤】**請洽總召！',
                    files: this.error_gif,
                    ephemeral: true
                }
            };
        };

        return {
            result: true
        };
    };

    async activePayerStatus(player_id) {
        const account_cursor = await (new Mongo('Bounty')).getCur('Accounts');

        const execute = {
            $set: {
                active: true
            }
        };
        const update_result = await account_cursor.updateOne({ user_id: player_id }, execute);
        if (!update_result.acknowledged) return {
            result: false,
            message: {
                content: ':x:**【個人狀態啟動錯誤】**請洽總召！',
                files: this.error_gif,
                ephemeral: true
            }
        };

        return {
            result: true
        };
    };
};


class bountyAccountManager {
    member_id: string;
    cursor_promise: Promise<Collection>;

    constructor(member_id: string) {
        this.member_id = member_id;

        // use promise here due to non-async constructor
        this.cursor_promise = (new Mongo('Bounty')).getCur('Accounts');
    };

    async checkAccount() {
        let member_data = await (await this.cursor_promise).findOne({ user_id: this.member_id });

        if (!member_data) {
            const create_status = await this._createAccount();
            return create_status;
        } else {
            return true;
        };
    };

    async _createAccount() {
        const default_member_data: MongoDataInterface = {
            _id: new ObjectId(),
            user_id: this.member_id,
            stamina: {
                regular: 3,
                extra: 0
            },
            active: false,
            record: {
                total_qns: {
                    easy: 0,
                    medium: 0,
                    hard: 0
                },
                correct_qns: {
                    easy: 0,
                    medium: 0,
                    hard: 0
                }
            }
        };

        let result = await (await this.cursor_promise).insertOne(default_member_data);

        return result.acknowledged;
    };
};


class BountyQuestionsManager extends CogExtension {
    slCmdRegister() {
        const cmd_register_list = [
            {
                name: 'activate',
                description: '建立問題資料庫'
            }
        ];

        (new MainGuildConfig(this.bot)).slCmdCreater(cmd_register_list);
    };

    async slCmdHandler(interaction) {
        if (!interaction.member.roles.cache.some(role => role.id === '743512491929239683')) return;

        switch (interaction.commandName) {
            case 'activate': {
                await interaction.deferReply();

                for (const diffi of ['easy', 'medium', 'hard']) {
                    const file_names = await getFolderFiles({
                        bucket_name: 'bounty-questions-db',
                        prefix: `${diffi}/`,
                        suffixes: '.png-.jpg'
                    });

                    for (let i = 0; i < file_names.length; i++) {
                        file_names[i] = file_names[i]
                            .replace(".png", '')
                            .replace(".jpg", '');
                    };

                    const cursor = await (new Mongo('Bounty')).getCur('Questions');

                    for (const file_name of file_names) {
                        const qns_data = {
                            _id: new ObjectId(),
                            qns_id: file_name,
                            difficulty: diffi,
                            ans: '',
                            time_avail: 150
                        };

                        await cursor.insertOne(qns_data);
                    };
                };
                await interaction.editReply(':white_check_mark: 問題資料庫已建立！');
            };
        };
    };
};


let BountyManager_act: BountyManager;
let BountyQuestionsManager_act: BountyQuestionsManager;

function promoter(bot: Client) {
    BountyManager_act = new BountyManager(bot);
    //BountyManager_act.slCmdRegister();

    BountyQuestionsManager_act = new BountyQuestionsManager(bot);
    //BountyQuestionsManager_act.slCmdRegister();
};

bot.on('interactionCreate', async (interaction) => {
    console.log('int!');
    if (!interactionChecker(interaction)) return;

    if (interaction.isCommand()) {
        console.log('cmdact!');
        await BountyManager_act.slCmdHandler(interaction);
        await BountyQuestionsManager_act.slCmdHandler(interaction);
    } else if (interaction.isSelectMenu()) {
        await BountyManager_act.dropdownHandler(interaction);
    };
});

export {
    promoter
};
