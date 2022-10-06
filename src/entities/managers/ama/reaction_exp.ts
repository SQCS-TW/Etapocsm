import { core, db } from '../../shortcut';
import { AMAPlatform } from '../../platforms/ama';

import { SLCMD_REGISTER_LIST, REACTION_EXP_EMBED } from './components';
import { CommandInteraction, MessageEmbed, MessageReaction, User, StageChannel } from 'discord.js';


export class ReactionExpManager extends core.BaseManager {
    public f_platform: AMAPlatform;

    private readonly ama_stage_channel_id = '947878783099224104';

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
            if (!core.discord.memberHasRole(interaction.member, ['AMA 講師'])) return;
            
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

        const end_time = core.discord.getRelativeTimestamp(core.timeAfterSecs(31));

        const exp_embed = new MessageEmbed(REACTION_EXP_EMBED)
            .setDescription(`👉在 ${end_time} 內按下表情符號以獲得 5~15 點經驗值！`);

        const exp_message = await interaction.channel.send('獲取資料中...');

        const reaction_exp_event_data = {
            msg_id: exp_message.id,
            participated_users_id: []
        };

        const insert_result = await (await this.f_platform.react_event_op.cursor).insertOne(reaction_exp_event_data);
        if (!insert_result.acknowledged) return await interaction.editReply('建立活動時發生錯誤...');
        else await interaction.editReply('活動建立成功！');

        await exp_message.edit({
            content: '.',
            embeds: [exp_embed]
        });
        await exp_message.react('✋');

        await core.sleep(30);
        await exp_message.delete();
        await (await this.f_platform.react_event_op.cursor).deleteMany({ msg_id: exp_message.id });
    }

    private async addReactionExp(messageReaction: MessageReaction, user: User) {

        const stage_channel = await this.f_platform.f_bot.channels.fetch(this.ama_stage_channel_id);
        if (!(stage_channel instanceof StageChannel)) return;

        const members = stage_channel.members;

        if (!members.get(user.id)) return;
        
        const event_data = await (await this.f_platform.react_event_op.cursor).findOne({ msg_id: messageReaction.message.id });
        if (!event_data) return;
        if (event_data.participated_users_id.includes(user.id)) try {
            return await user.send('還想重複獲取ama經驗值呀 ><！');
        } catch { return; }

        const user_lvl_data = await (await this.f_platform.mainlvl_acc_op.cursor).findOne({ user_id: user.id });
        
        const random_event_exp = core.getRandomInt(10) + 5;
        const exp_multiplier = user_lvl_data?.exp_multiplier ?? 1;
        const delta_exp = Math.round(random_event_exp * exp_multiplier);
        const update_result = await this.f_platform.ama_acc_op.addExp(user.id, delta_exp);

        if (update_result.status === db.StatusCode.WRITE_DATA_ERROR) return core.critical_logger.error({
            message: `[AMA] ${update_result.message}`,
            metadata: {
                player_id: user.id,
                delta_exp: delta_exp,
                error_code: db.StatusCode.WRITE_DATA_ERROR
            }
        });

        try {
            await user.send(`🥳｜你獲得了 ${delta_exp} 點經驗值`);
        } catch { /* ignore */ }
        
        const push_user_into_list = {
            $push: {
                participated_users_id: user.id
            }
        };
        await (await this.f_platform.react_event_op.cursor).updateOne({ msg_id: messageReaction.message.id }, push_user_into_list);
    }
}
