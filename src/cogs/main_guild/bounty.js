const { cogExtension, mainGuildConfig } = require('../../core/cog_config.js');
const { bot } = require('../../index.js');
const { slCmdChecker } = require('./verify.js');
const { Mongo } = require('../../core/db/mongodb.js');
const { Constants } = require('discord.js')


class quizManager extends cogExtension {
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

    async slCmdHandler(interaction) {
        if (!slCmdChecker(interaction)) return;
        if (!this.in_use) return;

        switch (interaction.commandName) {
            case 'activate_bounty': {
                await interaction.deferReply({ ephemeral: true });
                let account_status = await (new bountyAccountManager(interaction.member.id)).checkAccount();

                console.log('as', account_status);
                if (!account_status) {
                    await interaction.editReply({
                        content: '[帳號 創建/登入 錯誤] 請洽總召！',
                        ephemeral: true
                    })
                    return;
                };

                await interaction.editReply({
                    content: '[帳號檢查完畢][活動開始] ...！',
                    ephemeral: true
                });

                break;
            };
        }
    };
}

class bountyAccountManager {
    constructor(member_id) {
        this.member_id = member_id;
        this.cursor = (new Mongo('Etapocsm')).getCur('BountyAccounts');
    };

    async checkAccount() {
        let member_data = await (await this.cursor).findOne({ _id: this.member_id });

        if (!member_data) {
            let create_status = await this._createAccount();
            console.log('create_status', create_status);
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

        console.log('ack', result.acknowledged);
        return result.acknowledged;
    };
}


let quizManager_act;

function promoter(bot) {
    quizManager_act = new quizManager(bot);
    quizManager_act.slCmdRegister();
}

bot.on('interactionCreate', async (interaction) => quizManager_act.slCmdHandler(interaction));

module.exports = {
    promoter
}
