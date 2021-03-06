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
                    .setTitle('ð¥ï½æ¾ç¡è³æ')
                    .setDescription('å¾æ±æ­ï¼æåå·²ç¶ç¿»éäºè³æåº«\nä½ä½ å¥½åéæ²æéå§ç´¯ç©ç¶é©...')
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
                .setTitle(`ç¨æ¶ **${interaction.user.username}** çç­ç´è³æ`)
                .addField('ð å¸³èåµå»ºæ¥æ', core.discord.getRelativeTimestamp(user_data.create_date), true)
                .addField('â¨ ç¸½ç¶é©å¼', `**${user_data.total_exp}** é»`, true)
                .addField('ð° ç­ç´', `**${user_data.level}** ç´`, true)
                .addField('ðª åç´å©é¤ç¶é©', `**${exp_to_next_level}** é»`)
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
                .setTitle('ð¥ï½ç¶é©å10æè¡æ¦')
                .setDescription(user_data_beautify.join('\n'))
                .setColor('#ffffff');

            return await interaction.editReply({
                embeds: [rank_embed]
            });
        }
    }
}