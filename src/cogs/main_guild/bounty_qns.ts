import { CogExtension, MainGuildConfig } from '../../core/cog_config';
import { bot } from '../../index';
import { interactionChecker } from './verify';
import { Mongo } from '../../core/db/mongodb';
import { getFolderFiles } from '../../core/db/storj/ts_port';
import { Client, CommandInteraction, Constants, ApplicationCommandData } from 'discord.js'
import { ObjectId } from 'mongodb';


class BountyQuestionsManager extends CogExtension {
    slCmdRegister() {
        const cmd_register_list: Array<ApplicationCommandData> = [
            {
                name: 'activate',
                description: '建立問題資料庫'
            },
            {
                name: 'modify_choices',
                description: '修改問題選項',
                options: [
                    {
                        name: 'id',
                        description: '問題id',
                        type: Constants.ApplicationCommandOptionTypes.STRING,
                        required: true
                    },
                    {
                        name: 'choices',
                        description: '問題所有選項（用;隔開）',
                        type: Constants.ApplicationCommandOptionTypes.STRING,
                        required: true
                    }
                ]
            },
            {
                name: 'modify_answers',
                description: '修改問題答案',
                options: [
                    {
                        name: 'id',
                        description: '問題id',
                        type: Constants.ApplicationCommandOptionTypes.STRING,
                        required: true
                    },
                    {
                        name: 'ans',
                        description: '問題所有答案（用;隔開）',
                        type: Constants.ApplicationCommandOptionTypes.STRING,
                        required: true
                    }
                ]
            }
        ];

        (new MainGuildConfig(this.bot)).slCmdCreater(cmd_register_list);
    };

    async slCmdHandler(interaction: CommandInteraction) {
        if (!interaction.memberPermissions.has('ADMINISTRATOR')) return;

        switch (interaction.commandName) {
            case 'activate': {
                await interaction.deferReply({ ephemeral: true });

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
                            choices: [],
                            ans: [],
                            time_avail: 150
                        };

                        await cursor.insertOne(qns_data);
                    };
                };
                await interaction.editReply(':white_check_mark: 問題資料庫已建立！');

                break;
            };

            case 'modify_choices': {
                await interaction.deferReply({ ephemeral: true });

                const qns_id: string = interaction.options.getString('id');
                const qns_choices: Array<string> = (interaction.options.getString('choices')).split(';');

                const cursor = await (new Mongo('Bounty')).getCur('Questions');

                const execute = {
                    $set: {
                        choices: qns_choices
                    }
                };
                await cursor.updateOne({ qns_id: qns_id }, execute);
                await interaction.editReply(':white_check_mark: 問題選項已修改！');

                break;
            };

            case 'modify_answers': {
                await interaction.deferReply({ ephemeral: true });

                const qns_id: string = interaction.options.getString('id');
                const qns_ans: Array<string> = (interaction.options.getString('ans')).split(';');

                const cursor = await (new Mongo('Bounty')).getCur('Questions');

                const execute = {
                    $set: {
                        ans: qns_ans
                    }
                };
                await cursor.updateOne({ qns_id: qns_id }, execute);
                await interaction.editReply(':white_check_mark: 問題答案已修改！');

                break;
            };
        };
    };
};

let BountyQuestionsManager_act: BountyQuestionsManager;

function promoter(bot: Client) {
    BountyQuestionsManager_act = new BountyQuestionsManager(bot);
    BountyQuestionsManager_act.slCmdRegister();
};

bot.on('interactionCreate', async (interaction) => {
    if (!interactionChecker(interaction)) return;

    if (interaction.isCommand()) {
        await BountyQuestionsManager_act.slCmdHandler(interaction);
    };
});

export {
    promoter
};