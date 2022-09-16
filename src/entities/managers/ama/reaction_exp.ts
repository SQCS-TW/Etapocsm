import { core } from '../../shortcut';
import { AMAPlatform } from '../../platforms/ama';

import { SLCMD_REGISTER_LIST, REACTION_EXP_EMBED } from './components';
import { CommandInteraction, MessageEmbed, MessageReaction, User } from 'discord.js';


export class ReactionExpManager extends core.BaseManager {
    public f_platform: AMAPlatform;

    constructor(f_platform: AMAPlatform) {
        super();
        this.f_platform = f_platform;

        this.setupListener();

        this.slcmd_register_options = {
            guild_id: [core.GuildId.MAIN],
            cmd_list: SLCMD_REGISTER_LIST
        };
    }

    private setupListener() {
        this.f_platform.f_bot.on('interactionCreate', async (interaction) => {
            if (interaction.user.bot) return;
            if (interaction.isCommand()) await this.slcmdHandler(interaction);
        });

        this.f_platform.f_bot.on('messageReactionAdd', async (messageReaction, user) => {
            if (user.bot) return;
            if (messageReaction instanceof MessageReaction && user instanceof User)
                await this.addReactionExp(messageReaction, user);
        });
    }

    private async slcmdHandler(interaction: CommandInteraction) {
        if (interaction.commandName !== 'create-ama-reaction-exp-event') return;

        await interaction.deferReply();

        const exp = interaction.options.getInteger('exp');
        if (exp < 5) return await interaction.editReply('經驗值數值不行小於5！');
        else if (exp > 10) return await interaction.editReply('經驗值數值不行大於10！');

        const end_time = core.discord.getRelativeTimestamp(core.timeAfterSecs(31));

        const exp_embed = new MessageEmbed(REACTION_EXP_EMBED)
            .setDescription(`👉在 ${end_time} 內按下表情符號以獲得 ${exp} 點經驗值！`);

        const exp_message = await interaction.channel.send('獲取資料中...');

        const reaction_exp_event_data = {
            msg_id: exp_message.id,
            exp: exp,
            participated_users_id: []
        };

        const insert_result = await (await this.f_platform.react_exp_op.cursor).insertOne(reaction_exp_event_data);
        if (!insert_result.acknowledged) return await interaction.editReply('建立活動時發生錯誤...');
        else await interaction.editReply('活動建立成功！');

        await exp_message.edit({
            content: '.',
            embeds: [exp_embed]
        });
        await exp_message.react('✋');

        await core.sleep(31);
        await exp_message.delete();
        await (await this.f_platform.react_exp_op.cursor).deleteMany({ msg_id: exp_message.id });
    }

    private async addReactionExp(messageReaction: MessageReaction, user: User) {
        const event_data = await (await this.f_platform.react_exp_op.cursor).findOne({ msg_id: messageReaction.message.id });
        if (event_data.participated_users_id.includes(user.id)) try {
            return await user.send('還想重複獲取ama經驗值呀 ><！');
        } catch { /* ignore */}

        const user_lvl_data = await (await this.f_platform.mainlvl_acc_op.cursor).findOne({ user_id: user.id });

        const delta_exp = Math.round(event_data.exp * user_lvl_data.exp_multiplier);

        const update_exp = {
            $inc: {
                total_exp: delta_exp
            }
        };

        await (await this.f_platform.mainlvl_acc_op.cursor).updateOne({ user_id: user.id }, update_exp);

        const push_user_into_list = {
            $push: {
                participated_users_id: user.id
            }
        };

        await (await this.f_platform.react_exp_op.cursor).updateOne({ msg_id: messageReaction.message.id }, push_user_into_list);

        try {
            await user.send(`🥳｜你獲得了 ${delta_exp} 點經驗值`);
        } catch { /* ignore */ }
    }
}
