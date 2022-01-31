const { cogExtension, mainGuildConfig } = require('../../core/cog_config.js');
const { bot } = require('../../index.js');
const { slCmdChecker } = require('./verify.js');
const { Mongo } = require('../../core/db/mongodb.js');
const { Constants } = require('discord.js')


class quizManager extends cogExtension {
    slCmdRegister() {
        const cmd_register_list = [
            {
                name: 'alter_standby_ans',
                description: '修改下次問題答案',
                options: [
                    {
                        name: 'answer',
                        description: '要修改成的答案',
                        type: Constants.ApplicationCommandOptionTypes.STRING,
                        require: true
                    }
                ]
            },
            {
                name: 'alter_formal_ans',
                description: '修改這次問題的答案',
                options: [
                    {
                        name: 'answer',
                        description: '要修改成的答案',
                        type: Constants.ApplicationCommandOptionTypes.STRING,
                        require: true
                    }
                ]
            },
            {
                name: 'set_qns_link',
                description: '修改問題的圖片連結',
                options: [
                    {
                        name: 'link',
                        description: '要修改成的連結',
                        type: Constants.ApplicationCommandOptionTypes.STRING,
                        require: true
                    }
                ]
            },
            {
                name: 'set_ans_link',
                description: '修改答案的圖片連結',
                options: [
                    {
                        name: 'link',
                        description: '要修改成的連結',
                        type: Constants.ApplicationCommandOptionTypes.STRING,
                        require: true
                    }
                ]
            },
            {
                name: 'alt_member_result',
                description: '修改成員的答題狀態',
                options: [
                    {
                        name: 'member_id',
                        description: '要修改成員的id',
                        type: Constants.ApplicationCommandOptionTypes.STRING,
                        require: true
                    },
                    {
                        name: 'result',
                        description: '要修改成的狀態',
                        type: Constants.ApplicationCommandOptionTypes.BOOLEAN,
                        require: true,
                        choices: [
                            {
                                name: '正確',
                                value: true
                            },
                            {
                                name: '錯誤',
                                value: false
                            }
                        ]
                    }
                ]
            },
            // {
            //     name: 'repost_qns',
            //     description: '重新公告問題'
            // },
            // {
            //     name: 'repost_ans',
            //     description: '重新公告答案'
            // },
            // {
            //     name: 'manual_restart',
            //     description: '手動重設活動'
            // },
            // {
            //     name: 'manual_pause',
            //     description: '手動暫停活動'
            // },
            // {
            //     name: 'manual_continue',
            //     description: '手動恢復活動'
            // }
        ];

        (new mainGuildConfig(this.bot)).slCmdCreater(cmd_register_list);
    }

    async slCmdHandler(interaction) {
        if (!slCmdChecker(interaction)) return;
        if (!this.in_use) return;

        switch (interaction.commandName) {
            case 'alter_standby_ans': {
                await interaction.deferReply();
                const alter_answer = interaction.options.getString('answer');
                const execute = {
                    $set: {
                        stand_by_answer: alter_answer
                    }
                };

                const cursor = (new Mongo('sqcs-bot')).getCur('QuizSetting');
                (await cursor).updateOne({ _id: 0 }, execute)
                    .then(async () => {
                        await interaction.editReply(`:white_check_mark: 下次的答案被設定為 ${alter_answer} 了！`);
                    });
                break;
            };

            case 'alter_formal_ans': {
                await interaction.deferReply();
                const alter_answer = interaction.options.getString('answer');
                const execute = {
                    $set: {
                        correct_answer: alter_answer
                    }
                };

                const cursor = (new Mongo('sqcs-bot')).getCur('QuizSetting');
                (await cursor).updateOne({ _id: 0 }, execute)
                    .then(async () => {
                        await interaction.editReply(`:white_check_mark: 這次的答案被設定為 ${alter_answer} 了！`)
                    });
                break;
            };

            case 'set_qns_link': {
                await interaction.deferReply();
                const qns_link = interaction.options.getString('link');
                const execute = {
                    $set: {
                        qns_link: qns_link
                    }
                };

                const cursor = (new Mongo('sqcs-bot')).getCur('QuizSetting');
                (await cursor).updateOne({ _id: 0 }, execute)
                    .then(async () => {
                        await interaction.editReply(`:white_check_mark: 問題連結被設定為 ${qns_link} 了！`)
                    });
                break;
            };

            case 'set_ans_link': {
                await interaction.deferReply();
                const ans_link = interaction.options.getString('link');
                const execute = {
                    $set: {
                        ans_link: ans_link
                    }
                };

                const cursor = (new Mongo('sqcs-bot')).getCur('QuizSetting');
                (await cursor).updateOne({ _id: 0 }, execute)
                    .then(async () => {
                        await interaction.editReply(`:white_check_mark: 答案連結被設定為 ${ans_link} 了！`)
                    });
                break;
            };

            case 'alt_member_result': {
                await interaction.deferReply();
                const member_id = interaction.options.getString('member_id');
                const new_result = interaction.options.getBoolean('result');
                const execute = {
                    $set: {
                        correct: new_result
                    }
                };

                const member_name = interaction.guild.members.cache.get(member_id).displayName;

                const cursor = (new Mongo('sqcs-bot')).getCur('QuizSetting');
                (await cursor).updateOne({ _id: member_id }, execute)
                    .then(async () => {
                        await interaction.editReply(`:white_check_mark: 成員 ${member_name} 的答題狀態被設定為 ${new_result} 了！`)
                    });
                break;
            }
        };
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
