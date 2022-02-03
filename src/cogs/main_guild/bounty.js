const { cogExtension, mainGuildConfig } = require('../../core/cog_config.js');
const { bot } = require('../../index.js');
const { slCmdChecker } = require('./verify.js');
const { Mongo } = require('../../core/db/mongodb.js');
const { Constants } = require('discord.js');
const { storj_download, get_folder_size } = require('../../core/db/storj/js_port.js');
const fs = require('fs');


class bountyManager extends cogExtension {
    slCmdRegister() {
        const cmd_register_list = [
            {
                name: 'activate_bounty',
                description: '開始懸賞活動',
                options: [
                    {
                        name: 'difficulty',
                        description: '難度',
                        type: Constants.ApplicationCommandOptionTypes.INTEGER,
                        require: true,
                        choices: [
                            {
                                name: '簡單',
                                value: 0
                            },
                            {
                                name: '中等',
                                value: 1
                            },
                            {
                                name: '困難',
                                value: 2
                            }
                        ]
                    }
                ]
            }
        ];

        (new mainGuildConfig(this.bot)).slCmdCreater(cmd_register_list);
    };

    getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

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
                        content: '[帳號 創建/登入 錯誤] 請洽總召！',
                        ephemeral: true
                    })
                    return;
                };

                await interaction.editReply({
                    content: '[帳號檢查完畢] 活動開始！',
                    ephemeral: true
                });

                const diffi = interaction.options.getInteger('difficulty');
                const total_qns_count = await get_folder_size('bounty-questions-db', `${diffi}/`);
                const number = this.getRandomInt(total_qns_count);

                let result = await storj_download('bounty-questions-db', `./assets/buffer/storj/${number}.png`, `${diffi}/${number}.png`);
                if (!result) {
                    await interaction.followUp({
                        content: '[題目獲取錯誤] 請洽總召！',
                        files: [
                            './assets/gif/error.gif'
                        ],
                        ephemeral: true
                    });
                    return;
                };

                await interaction.followUp({
                    content: '[題目]',
                    files: [
                        `./assets/buffer/storj/${number}.png`
                    ],
                    ephemeral: true
                });

                fs.unlink(`./assets/buffer/storj/${number}.png`, (err) => { });

                // push to pipeline
                break;
            };
        }
    };
}


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
        }
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
}


let bountyManager_act;

function promoter(bot) {
    bountyManager_act = new bountyManager(bot);
    bountyManager_act.slCmdRegister();
}

bot.on('interactionCreate', async (interaction) => bountyManager_act.slCmdHandler(interaction));

module.exports = {
    promoter
}
