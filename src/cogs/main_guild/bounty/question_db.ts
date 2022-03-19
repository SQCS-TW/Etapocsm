import { CogExtension, MainGuildConfig } from '../../../core/cog_config';
import { bot, Etapocsm } from '../../../../main';
import { interactionChecker } from '../verify';
import { Mongo } from '../../../core/db/mongodb';
import { getFolderFiles } from '../../../core/db/storj/ts_port';
import { CommandInteraction } from 'discord.js';
import { ObjectId } from 'mongodb';
import { SLCMD_REGISTER_LIST } from './constants/question_db';


class BountyQuestionsManager extends CogExtension {
    public async slCmdRegister() {
        (new MainGuildConfig(this.bot)).slCmdCreater(SLCMD_REGISTER_LIST);
    }

    async slCmdHandler(interaction: CommandInteraction) {
        if (!(this.checkPerm(interaction, 'ADMINISTRATOR'))) return;

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
                    }

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
                    }
                }
                await interaction.editReply(':white_check_mark: 問題資料庫已建立！');

                break;
            }

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
            }

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
            }
        }
    }
}

let BountyQuestionsManager_act: BountyQuestionsManager;

async function promoter(bot: Etapocsm): Promise<string> {
    const cog_name = 'bounty_qns_manager';
    BountyQuestionsManager_act = new BountyQuestionsManager(bot);
    //await BountyQuestionsManager_act.slCmdRegister();
    return cog_name;
}

bot.on('interactionCreate', async (interaction) => {
    if (!interactionChecker(interaction)) return;

    await bot.interactionAllocater({
        interaction: interaction,
        interaction_managers: [
            BountyQuestionsManager_act
        ]
    });
});

export {
    promoter
};
