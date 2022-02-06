const { CogExtension, MainGuildConfig } = require('../../core/cog_config.js');
const { bot } = require('../../index.js');
const { slCmdChecker } = require('./verify.js');
const { Mongo } = require('../../core/db/mongodb.js');
const { Constants } = require('discord.js');
const { storjDownload, getFolderFiles } = require('../../core/db/storj/js_port.js');
const fs = require('fs');


class BountyManager extends CogExtension {
    slCmdRegister() {
        const cmd_register_list = [
            {
                name: 'activate_bounty',
                description: '開始懸賞活動',
                options: [
                    {
                        name: 'difficulty',
                        description: '難度',
                        type: Constants.ApplicationCommandOptionTypes.STRING,
                        require: true,
                        choices: [
                            {
                                name: '簡單',
                                value: 'easy'
                            },
                            {
                                name: '中等',
                                value: 'medium'
                            },
                            {
                                name: '困難',
                                value: 'hard'
                            }
                        ]
                    }
                ]
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

                const diffi = interaction.options.getString('difficulty');
                const files = await getFolderFiles(
                    bucket_name = 'bounty-questions-db',
                    prefix = `${diffi}/`,
                    suffixes = '.png-.jpg'
                );
                const random_filename = files[this.getRandomInt(files.length)];

                let result = await storjDownload(
                    bucket_name = 'bounty-questions-db',
                    local_file_name = `./assets/buffer/storj/${random_filename}`,
                    db_file_name = `${diffi}/${random_filename}`
                );
                if (!result) {
                    await interaction.followUp({
                        content: ':x:**【題目獲取錯誤】**請洽總召！',
                        files: [
                            './assets/gif/error.gif'
                        ],
                        ephemeral: true
                    });
                    return;
                };

                await interaction.followUp({
                    content: '**【題目】**',
                    files: [
                        `./assets/buffer/storj/${random_filename}`
                    ],
                    ephemeral: true
                });

                fs.unlink(`./assets/buffer/storj/${random_filename}`, (err) => { });

                // push to pipeline
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

bot.on('interactionCreate', async (interaction) => BountyManager_act.slCmdHandler(interaction));
bot.on('interactionCreate', async (interaction) => BountyQuestionsManager_act.slCmdHandler(interaction));


module.exports = {
    promoter
};
