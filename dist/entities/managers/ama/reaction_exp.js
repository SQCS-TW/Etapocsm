"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReactionExpManager = void 0;
const shortcut_1 = require("../../shortcut");
const components_1 = require("./components");
const discord_js_1 = require("discord.js");
class ReactionExpManager extends shortcut_1.core.BaseManager {
    constructor(f_platform) {
        super();
        this.ama_stage_channel_id = '947878783099224104';
        this.f_platform = f_platform;
        this.setupListener();
        this.slcmd_register_options = {
            guild_id: [shortcut_1.core.GuildId.MAIN],
            cmd_list: components_1.SLCMD_REGISTER_LIST
        };
    }
    setupListener() {
        this.f_platform.f_bot.on('interactionCreate', async (interaction) => {
            if (interaction.user.bot)
                return;
            let role_found = false;
            const roles = interaction?.member?.roles;
            if (roles instanceof (Array)) {
                roles.forEach(role => {
                    if (['AMA 講師'].includes(role))
                        role_found = true;
                });
            }
            else if (roles instanceof discord_js_1.GuildMemberRoleManager) {
                if (roles.cache.some(role => ['AMA 講師'].includes(role.name)))
                    role_found = true;
            }
            if (!role_found)
                return;
            if (interaction.isCommand())
                await this.slcmdHandler(interaction);
        });
        this.f_platform.f_bot.on('messageReactionAdd', async (messageReaction, user) => {
            if (user.bot)
                return;
            if (messageReaction instanceof discord_js_1.MessageReaction && user instanceof discord_js_1.User)
                await this.addReactionExp(messageReaction, user);
        });
    }
    async slcmdHandler(interaction) {
        if (interaction.commandName !== 'create-ama-reaction-exp-event')
            return;
        await interaction.deferReply();
        const end_time = shortcut_1.core.discord.getRelativeTimestamp(shortcut_1.core.timeAfterSecs(31));
        const exp_embed = new discord_js_1.MessageEmbed(components_1.REACTION_EXP_EMBED)
            .setDescription(`👉在 ${end_time} 內按下表情符號以獲得 5~15 點經驗值！`);
        const exp_message = await interaction.channel.send('獲取資料中...');
        const reaction_exp_event_data = {
            msg_id: exp_message.id,
            participated_users_id: []
        };
        const insert_result = await (await this.f_platform.react_event_op.cursor).insertOne(reaction_exp_event_data);
        if (!insert_result.acknowledged)
            return await interaction.editReply('建立活動時發生錯誤...');
        else
            await interaction.editReply('活動建立成功！');
        await exp_message.edit({
            content: '.',
            embeds: [exp_embed]
        });
        await exp_message.react('✋');
        await shortcut_1.core.sleep(30);
        await exp_message.delete();
        await (await this.f_platform.react_event_op.cursor).deleteMany({ msg_id: exp_message.id });
    }
    async addReactionExp(messageReaction, user) {
        const stage_channel = await this.f_platform.f_bot.channels.fetch(this.ama_stage_channel_id);
        if (!(stage_channel instanceof discord_js_1.StageChannel))
            return;
        const members = stage_channel.members;
        if (!members.get(user.id))
            return;
        const event_data = await (await this.f_platform.react_event_op.cursor).findOne({ msg_id: messageReaction.message.id });
        if (!event_data)
            return;
        if (event_data.participated_users_id.includes(user.id))
            try {
                return await user.send('還想重複獲取ama經驗值呀 ><！');
            }
            catch {
                return;
            }
        const user_lvl_data = await (await this.f_platform.mainlvl_acc_op.cursor).findOne({ user_id: user.id });
        const random_event_exp = shortcut_1.core.getRandomInt(10) + 5;
        const exp_multiplier = user_lvl_data?.exp_multiplier ?? 1;
        const delta_exp = Math.round(random_event_exp * exp_multiplier);
        const update_result = await this.f_platform.ama_acc_op.addExp(user.id, delta_exp);
        if (update_result.status === shortcut_1.db.StatusCode.WRITE_DATA_ERROR)
            return shortcut_1.core.critical_logger.error({
                message: `[AMA] ${update_result.message}`,
                metadata: {
                    player_id: user.id,
                    delta_exp: delta_exp,
                    error_code: shortcut_1.db.StatusCode.WRITE_DATA_ERROR
                }
            });
        try {
            await user.send(`🥳｜你獲得了 ${delta_exp} 點經驗值`);
        }
        catch { }
        const push_user_into_list = {
            $push: {
                participated_users_id: user.id
            }
        };
        await (await this.f_platform.react_event_op.cursor).updateOne({ msg_id: messageReaction.message.id }, push_user_into_list);
    }
}
exports.ReactionExpManager = ReactionExpManager;
