import { CommandInteraction, MessageEmbed } from 'discord.js';
import { core } from '../../shortcut';
import { REGISTER_LIST } from './components';

export class UserInteractionHandler extends core.BaseManager {

    private mainlvl_acc_op = new core.BaseMongoOperator({
        db: 'Level',
        coll: 'Accounts'
    });

    private mainlvl_data_op = new core.BaseMongoOperator({
        db: 'Level',
        coll: 'Data'
    });

    // constants waiting to be fetched
    private lvl_exp_dict = undefined;

    constructor(f_platform: core.BasePlatform) {
        super(f_platform);
        
        this.setupListener();

        this.slcmd_register_options = {
            guild_id: [core.GuildId.MAIN],
            cmd_list: REGISTER_LIST
        };
    }

    private setupListener() {
        this.f_platform.f_bot.on('interactionCreate', async (interaction) => {
            if (interaction.isCommand()) await this.slcmdHandler(interaction);
        });
    }

    private async slcmdHandler(interaction: CommandInteraction) {
        if (interaction.commandName === 'check-lvl-data') {

            await interaction.deferReply({ ephemeral: true });
            const user_data = await (await this.mainlvl_acc_op.cursor).findOne({ user_id: interaction.user.id });
            if (!user_data) {
                const resp_embed = new MessageEmbed()
                    .setTitle('😥｜找無資料')
                    .setDescription('很抱歉，我們已經翻遍了資料庫\n但你好像還沒有開始累積經驗...')
                    .setColor('#ffffff');
                return await interaction.editReply({
                    embeds: [resp_embed]
                });
            }

            if (!this.lvl_exp_dict) {
                const lvl_exp_dict = await (await this.mainlvl_data_op.cursor).findOne({ type: 'level-exp-dict' });
                this.lvl_exp_dict = lvl_exp_dict.exp_dict;
            }

            let exp_to_next_level: number;
            if (user_data.level !== 60) exp_to_next_level = this.lvl_exp_dict[user_data.level + 1] - user_data.total_exp;
            else exp_to_next_level = undefined;

            const resp_embed = new MessageEmbed()
                .setTitle(`用戶 **${interaction.user.username}** 的等級資料`)
                .addField('🕑 帳號創建日期', core.discord.getRelativeTimestamp(user_data.create_date), true)
                .addField('✨ 總經驗值', `**${user_data.total_exp}** 點`, true)
                .addField('🔰 等級', `**${user_data.level}** 級`, true)
                .addField('💪 升級剩餘經驗', `**${exp_to_next_level}** 點`)
                .setColor('#ffffff');

            return await interaction.editReply({
                embeds: [resp_embed]
            });
        } else if (interaction.commandName === 'check-lvl-rank') {
            await interaction.deferReply();
            const server_lvl_data = await (await this.mainlvl_acc_op.cursor).find().sort({ total_exp: -1 }).limit(10).toArray();

            const user_data_beautify: string[] = [];
            await core.asyncForEach(server_lvl_data, async (user_data) => {
                const member = await interaction.guild.members.fetch(user_data.user_id);
                user_data_beautify.push(
                    `**${member.displayName}**: **${user_data.total_exp}** exp, LV.**${user_data.level}**`
                );
            });

            const rank_embed = new MessageEmbed()
                .setTitle('🥇｜經驗前10排行榜')
                .setDescription(user_data_beautify.join('\n'))
                .setColor('#ffffff');

            return await interaction.editReply({
                embeds: [rank_embed]
            });
        }
    }
}