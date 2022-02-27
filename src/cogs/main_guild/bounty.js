const { CogExtension, MainGuildConfig } = require('../../core/cog_config.js');
const { bot } = require('../../index.js');
const { slCmdChecker, buttonChecker, dropdownChecker } = require('./verify.js');
const { Mongo } = require('../../core/db/mongodb.js');
const { Constants } = require('discord.js');
const { storjDownload, getFolderFiles } = require('../../core/db/storj/js_port.js');
const fs = require('fs');


class BountyManager extends CogExtension {
    slCmdRegister() {
        const cmd_register_list = [
            {
                name: 'activate_bounty',
                description: '開始懸賞活動'
            }
        ];

        (new MainGuildConfig(this.bot)).slCmdCreater(cmd_register_list);
    };

    getRandomInt(max) {
        return Math.floor(Math.random() * max);
    };

    async slCmdHandler(interaction) {
        if (!slCmdChecker(interaction)) return;
        if (!this.in_use) return;

        // only receive messages from the bounty-use channel
        // currently use cmd-use channel for testing
        if (interaction.channel.id !== '743677861000380527') return;

        switch (interaction.commandName) {
            case 'activate_bounty': {
                await interaction.deferReply({ ephemeral: true });

                let account_status = await (new bountyAccountManager(interaction.member.id)).checkAccount();
                if (!account_status) {
                    await interaction.editReply({
                        content: ':x:**【帳號 創建/登入 錯誤】**請洽總召！',
                        ephemeral: true
                    });
                    return;
                };

                await interaction.editReply({
                    content: ':white_check_mark:**【帳號檢查完畢】**活動開始！',
                    ephemeral: true
                });

                const dropdown_msg = await interaction.followUp({
                    content: '請選擇問題難度（限時 15 秒）',
                    components: this.bounty_qns_difficulty_dropdown,
                    fetchReply: true,
                    ephemeral: true
                });
                const dropdown_id = dropdown_msg.id;

                const cursor = await (new Mongo('Interaction')).getCur('Pipeline');

                const player_application = {
                    _id: interaction.user.id,
                    linked_dropdown_id: dropdown_id,
                    type: 'choose_bounty_qns_difficulty',
                    due_time: Date.now() + 15 * 1000
                }

                const apply_result = await (await cursor).insertOne(player_application);
                if (!apply_result.acknowledged) {
                    await dropdown_msg.delete();
                    await interaction.followUp({
                        content: ':x:**【選單申請錯誤】**請洽總召！',
                        files: this.error_gif,
                        ephemeral: true
                    });

                    return;
                };

                break;

                // const diffi = interaction.options.getString('difficulty');
                // const files = await getFolderFiles(
                //     bucket_name = 'bounty-questions-db',
                //     prefix = `${diffi}/`,
                //     suffixes = '.png-.jpg'
                // );
                // const random_filename = files[this.getRandomInt(files.length)];

                // let result = await storjDownload(
                //     bucket_name = 'bounty-questions-db',
                //     local_file_name = `./assets/buffer/storj/${random_filename}`,
                //     db_file_name = `${diffi}/${random_filename}`
                // );
                // if (!result) {
                //     await interaction.followUp({
                //         content: ':x:**【題目獲取錯誤】**請洽總召！',
                //         files: this.error_gif,
                //         ephemeral: true
                //     });
                //     return;
                // };

                // await interaction.followUp({
                //     content: '**【題目】**',
                //     files: [
                //         `./assets/buffer/storj/${random_filename}`
                //     ],
                //     ephemeral: true
                // });

                // fs.unlink(`./assets/buffer/storj/${random_filename}`, (err) => { });

                // // push to pipeline: warning: not tested yet
                // const qns_cursor = (new Mongo('Bounty')).getCur('Questions');

                // const qns_id = random_filename
                //     .replace(".png", '')
                //     .replace(".jpg", '');

                // const qns_data = (await qns_cursor).findOne({ _id: qns_id });
                // const time_until = Date.now() + qns_data.time_avail * 1000; // in miliseconds

                // const player_data = {
                //     _id: interaction.member.id,
                //     stop_time: time_until
                // };

                // const pipeline_cursor = (new Mongo('Bounty')).getCur('OngoingPipeline');
                // const ongoing_data_insert_result = await (await pipeline_cursor).insertOne(player_data);

                // if (!ongoing_data_insert_result.acknowledged) {
                //     await interaction.followUp({
                //         content: ':x:**【計時檔案建立錯誤】**請洽總召！',
                //         files: this.error_gif,
                //         ephemeral: true
                //     });
                //     return;
                // };

                // const account_cursor = (new Mongo('Bounty')).getCur('Accounts');
                // const execute = {
                //     $set: {
                //         active: true
                //     }
                // };

                // const update_result = await (await account_cursor).updateOne({ _id: interaction.member.id }, execute);
                // if (!update_result.acknowledged) {
                //     await interaction.followUp({
                //         content: ':x:**【個人狀態設定錯誤】**請洽總召！',
                //         files: this.error_gif,
                //         ephemeral: true
                //     });
                //     return;
                // };
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

    async dropdownHandler(interaction) {
        if (!dropdownChecker(interaction)) return;
        if (!this.in_use) return;

        // only receive messages from the bounty-use channel
        // currently use cmd-use channel for testing
        if (interaction.channel.id !== '743677861000380527') return;

        switch (interaction.component.customId) {
            case 'choose_bounty_qns_difficulty': {
                await interaction.deferReply({ ephemeral: true });

                const cursor = await (new Mongo('Interaction')).getCur('Pipeline');

                const verify = {
                    _id: interaction.user.id,
                    type: 'choose_bounty_qns_difficulty'
                };
                const player_application = await (await cursor).findOne(verify);

                if (!player_application) {
                    await interaction.editReply({
                        content: ':x:**【申請認證錯誤】**選單已經逾期；或是請勿重複選擇。',
                        files: this.error_gif,
                        ephemeral: true
                    });

                    return;
                };

                await (await cursor).deleteOne(verify);
                await interaction.editReply(`you clicked ${interaction.values}!`);

                break;
            };
        };
    };
};


class bountyAccountManager {
    constructor(member_id) {
        this.member_id = member_id;
        this.cursor = (new Mongo('Bounty')).getCur('Accounts');
    };

    async checkAccount() {
        let member_data = await (await this.cursor).findOne({ _id: this.member_id });

        if (!member_data) {
            let create_status = await this._createAccount();
            return create_status;
        } else {
            return true;
        };
    };

    async _createAccount() {
        const default_member_data = {
            _id: this.member_id,
            stamina: {
                regular: 3,
                extra: 0
            },
            active: false,
            record: {
                total_qns: 0,
                correct_qns: 0
            }
        };

        let result = await (await this.cursor).insertOne(default_member_data);

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
        if (!slCmdChecker(interaction)) return;
        if (!interaction.member.roles.cache.some(role => role.id === '743512491929239683')) return;

        switch (interaction.commandName) {
            case 'activate': {
                await interaction.deferReply();

                for (const diffi of ['easy', 'medium', 'hard']) {
                    const file_names = await getFolderFiles(
                        bucket_name = 'bounty-questions-db',
                        prefix = `${diffi}/`,
                        suffixes = '.png-.jpg'
                    );

                    for (let i = 0; i < file_names.length; i++) {
                        file_names[i] = file_names[i]
                            .replace(".png", '')
                            .replace(".jpg", '');
                    };

                    const cursor = (new Mongo('Bounty')).getCur('Questions');

                    for (const file_name of file_names) {
                        const qns_data = {
                            _id: file_name,
                            difficulty: diffi,
                            ans: '',
                            time_avail: 150
                        };

                        await (await cursor).insertOne(qns_data);
                    };
                };
                await interaction.editReply(':white_check_mark: 問題資料庫已建立！');
            };
        };
    };
};


let BountyManager_act;
let BountyQuestionsManager_act;

function promoter(bot) {
    BountyManager_act = new BountyManager(bot);
    BountyManager_act.slCmdRegister();

    BountyQuestionsManager_act = new BountyQuestionsManager(bot);
    BountyQuestionsManager_act.slCmdRegister();
};

bot.on('interactionCreate', async (interaction) => {
    await BountyManager_act.slCmdHandler(interaction);
    await BountyManager_act.dropdownHandler(interaction);
});

bot.on('interactionCreate', async (interaction) => BountyQuestionsManager_act.slCmdHandler(interaction));


module.exports = {
    promoter
};
