import { CogExtension, MainGuildConfig } from '../../../core/cog_config';
import { bot } from '../../../index';
import { interactionChecker } from '../verify';
import { Mongo, MongoDataInterface } from '../../../core/db/mongodb';
import { storjDownload, getFolderFiles } from '../../../core/db/storj/ts_port';
import fs from 'fs';
import { timeAfterSecs, getRandomInt, verifyMenuApplication, getSubsetsWithCertainLength, shuffle, arrayEquals, binomialCoefficient, cloneObj } from '../../../core/utils';
import { CommandInteraction, SelectMenuInteraction, ApplicationCommandData, Client, Constants } from 'discord.js'
import { ObjectId } from 'mongodb';
import { bountyAccountManager } from './account'


class BountyManager extends CogExtension {
    private bountyAccountManager_act: bountyAccountManager;

    constructor(bot: Client) {
        super(bot);
        this.bountyAccountManager_act = new bountyAccountManager();
    };

    public slCmdRegister() {
        const cmd_register_list: Array<ApplicationCommandData> = [
            {
                name: 'activate_bounty',
                description: '開始懸賞活動'
            },
            {
                name: 'end_bounty',
                description: '結束懸賞活動（回答問題）'
            },
            {
                name: 'set_status',
                description: '設定用戶狀態',
                options: [
                    {
                        name: 'user_id',
                        description: '用戶id',
                        type: Constants.ApplicationCommandOptionTypes.STRING,
                        required: true
                    },
                    {
                        name: 'status',
                        description: '新的用戶狀態',
                        type: Constants.ApplicationCommandOptionTypes.BOOLEAN,
                        required: true
                    }
                ]
            }
        ];

        (new MainGuildConfig(this.bot)).slCmdCreater(cmd_register_list);
    };

    public async slCmdHandler(interaction: CommandInteraction) {
        if (!this.in_use) return;

        // only receive messages from the bounty-use channel
        // currently use cmd-use channel for testing
        if (interaction.channel.id !== '743677861000380527') return;

        switch (interaction.commandName) {
            case 'activate_bounty': {
                await interaction.deferReply({ ephemeral: true });

                // check if the user is already answering questions:
                const account_cursor = await (new Mongo('Bounty')).getCur('Accounts');
                const user_data = await account_cursor.findOne({ user_id: interaction.user.id });

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

                let account_status = await this.bountyAccountManager_act.checkAccount(interaction.user.id);
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

            case 'end_bounty': {
                await interaction.deferReply({ ephemeral: true });

                // check if the user is answering questions:
                const account_cursor = await (new Mongo('Bounty')).getCur('Accounts');
                const user_data = await account_cursor.findOne({ user_id: interaction.user.id });

                if (!user_data) {
                    await interaction.editReply({
                        content: ':x:**【帳號錯誤】**你還沒啟動過活動！'
                    });
                    return;
                };

                if (!user_data.active) {
                    await interaction.editReply({
                        content: ':x:**【狀態錯誤】**你還沒啟動過活動！'
                    });
                    return;
                };
                //

                const ongoing_cursor = await (new Mongo('Bounty')).getCur('OngoingPipeline');
                const qns_cursor = await (new Mongo('Bounty')).getCur('Questions');

                const ongoing_data = await ongoing_cursor.findOne({ user_id: interaction.user.id });
                const qns_data = await qns_cursor.findOne({ qns_id: ongoing_data.qns_id });

                const choices: Array<string> = await this.generateQuestionChoices(qns_data.choices, qns_data.ans);

                let ans_dropdown = [await cloneObj(this.bounty_choose_ans_dropdown[0])];

                choices.forEach(item => {
                    ans_dropdown[0].components[0].options.push({
                        label: item,
                        value: item
                    });
                });

                await interaction.editReply({
                    content: '請選擇答案（限時 1 分鐘）',
                    components: ans_dropdown
                });

                const player_application: MongoDataInterface = {
                    _id: new ObjectId(),
                    user_id: interaction.user.id,
                    type: 'choose_bounty_ans',
                    due_time: (await timeAfterSecs(60))
                };

                const interaction_cursor = await (new Mongo('Interaction')).getCur('Pipeline');
                const apply_result = await interaction_cursor.insertOne(player_application);
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

            case 'set_status': {
                if (!this.checkPerm(interaction, 'ADMINISTRATOR')) {
                    return await interaction.reply(this.perm_warning);
                };

                await interaction.deferReply({ ephemeral: true });

                const user_id: string = interaction.options.getString('user_id');
                const new_status: boolean = interaction.options.getBoolean('status');

                const set_result = await this.bountyAccountManager_act.setStatus(user_id, new_status);

                await interaction.editReply(set_result.message);

                break;
            };
        };
    };

    private async generateQuestionChoices(qns_choices: Array<string>, qns_ans: Array<string>) {
        // ex:
        // qns_choices = ['A', 'B', 'C', 'D', 'E', 'F'];
        // qns_ans = ['A', 'C'];

        let result: Array<any> = await getSubsetsWithCertainLength(qns_choices, qns_ans.length);
        result = result.filter(async (item) => { return (item.length === qns_ans.length && !(await arrayEquals(item, qns_ans))) });
        result = await shuffle(result);

        const random_choices_count = Math.min(
            Math.pow(2, qns_ans.length) + 2,
            await binomialCoefficient(qns_choices.length, qns_ans.length)
        ) - 1;

        result = result.slice(0, random_choices_count);
        result.push(qns_ans);
        result = await shuffle(result);
        result = result.map((item) => { return item.join(', ') });
        return result;
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

    bounty_choose_ans_dropdown = [
        {
            type: 1,
            components: [
                {
                    type: 3,
                    placeholder: "選個答案吧！",
                    custom_id: "choose_bounty_ans",
                    options: [],
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

            case 'choose_bounty_ans': {
                //

                break;
            };
        };
    };

    async downloadQnsPicture(diffi: string) {
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

    private async appendToPipeline(diffi: string, random_filename: string, player_id: string) {
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
            due_time: await timeAfterSecs(qns_data.time_avail),
            freeze: false
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

    private async activePayerStatus(player_id: string) {
        const set_result = await this.bountyAccountManager_act.setStatus(player_id, true);

        if (!set_result.result) return {
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


let BountyManager_act: BountyManager;

function promoter(bot: Client) {
    BountyManager_act = new BountyManager(bot);
    BountyManager_act.slCmdRegister();
};

bot.on('interactionCreate', async (interaction) => {
    if (!interactionChecker(interaction)) return;

    if (interaction.isCommand()) {
        await BountyManager_act.slCmdHandler(interaction);
    } else if (interaction.isSelectMenu()) {
        await BountyManager_act.dropdownHandler(interaction);
    };
});

export {
    promoter
};
