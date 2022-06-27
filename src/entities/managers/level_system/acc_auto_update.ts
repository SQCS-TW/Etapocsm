import { Guild, MessageEmbed } from 'discord.js';
import { core } from '../../shortcut';

export class AutoUpdateAccountManager extends core.BaseManager {
    // operators
    private mainlvl_acc_op = new core.MainLevelAccountOperator();
    private bounty_acc_op = new core.BountyUserAccountOperator();
    private chat_acc_op = new core.ChatAccountOperator();

    private mainlvl_data_op = new core.BaseMongoOperator({
        db: 'Level',
        coll: 'Data'
    });

    // constants
    private mins_in_mili_secs = 60 * 1000;
    private sqcs_main_guild_id = '743507979369709639';

    // data to be cached
    private lvl_exp_dict = undefined;
    private exp_role_id_dict = undefined;
    private sqcs_main_guild: Guild = undefined;

    constructor(f_platform: core.BasePlatform) {
        super(f_platform);

        this.setupListener();
    }

    private async setupListener() {
        this.f_platform.f_bot.on('ready', async () => {
            await this.updateTotalExp();
            await this.updateCurrLevel();
            await this.updateGuildRole();
        });

        this.f_platform.f_bot.on('rateLimit', async (rateLimitData) => {
            console.log('**RATE LIMITED**:', rateLimitData);
        });
    }

    private async updateTotalExp() {
        const self_routine = () => setTimeout(async () => { await this.updateTotalExp() }, 2 * this.mins_in_mili_secs);

        const users_data = await (await this.mainlvl_acc_op.cursor).find({}).toArray();
        const other_acc_cursors = [
            this.bounty_acc_op,
            this.chat_acc_op
        ];

        for (let i = 0; i < users_data.length; i++) {
            const user_mainlvl_data = users_data[i];
            let user_exps = 0;

            for (let j = 0; j < other_acc_cursors.length; j++) {
                const cursor = other_acc_cursors[j];
                const user_acc_data = await (await cursor.cursor).findOne({ user_id: user_mainlvl_data.user_id });

                if (user_acc_data) user_exps += user_acc_data.exp;
            }

            const update_exp = {
                $set: {
                    total_exp: user_exps
                }
            }
            await (await this.mainlvl_acc_op.cursor).updateOne({ user_id: user_mainlvl_data.user_id }, update_exp);
        }

        return self_routine();
    }

    private async updateCurrLevel() {
        const self_routine = () => setTimeout(async () => { await this.updateCurrLevel() }, 2 * this.mins_in_mili_secs);

        const users_data = await (await this.mainlvl_acc_op.cursor).find({}).toArray();

        for (let i = 0; i < users_data.length; i++) {
            const user_mainlvl_data = users_data[i];

            const new_lvl = await this.getUserLevel(user_mainlvl_data.total_exp);
            if (new_lvl === user_mainlvl_data.level) continue;

            const update_lvl = {
                $set: {
                    level: new_lvl
                }
            }
            await (await this.mainlvl_acc_op.cursor).updateOne({ user_id: user_mainlvl_data.user_id }, update_lvl);
            await this.sendUserLevelUpdate(user_mainlvl_data.user_id, user_mainlvl_data.level, new_lvl);
        }

        return self_routine();
    }

    private async getUserLevel(exp: number) {
        if (!this.lvl_exp_dict) {
            const lvl_exp_data = await (await this.mainlvl_data_op.cursor).findOne({ type: 'level-exp-dict' });
            this.lvl_exp_dict = lvl_exp_data.exp_dict;
        }

        for (let cur_lvl = 0; cur_lvl <= 60; cur_lvl++) {
            if (cur_lvl === 60) return cur_lvl;
            else if (this.lvl_exp_dict[cur_lvl] <= exp && exp < this.lvl_exp_dict[cur_lvl + 1]) return cur_lvl;
        }
    }

    private async sendUserLevelUpdate(user_id: string, old_lvl: number, new_lvl: number) {
        this.sqcs_main_guild = this.sqcs_main_guild ?? await this.f_platform.f_bot.guilds.fetch(this.sqcs_main_guild_id);

        const member = await this.sqcs_main_guild.members.fetch(user_id);
        try {
            let notif_embed: MessageEmbed;
            if (old_lvl < new_lvl) {
                notif_embed = new MessageEmbed()
                    .setTitle('📈｜你升級了！')
                    .setDescription(`LV.**${old_lvl}** -> LV.**${new_lvl}**`);
            } else {
                notif_embed = new MessageEmbed()
                    .setTitle('📉｜你降級了...')
                    .setDescription(`LV.**${old_lvl}** -> LV.**${new_lvl}**`);
            }
            notif_embed.setColor('#ffffff');

            await member.send({
                embeds: [notif_embed]
            });
        } catch { /*pass*/ }
    }

    private async updateGuildRole() {
        const self_routine = () => setTimeout(async () => { await this.updateGuildRole() }, 3 * this.mins_in_mili_secs);

        if (!this.exp_role_id_dict) {
            const exp_role_id_data = await (await this.mainlvl_data_op.cursor).findOne({ type: 'exp-role-id-dict' });
            this.exp_role_id_dict = exp_role_id_data.role_id_dict;
        }

        if (!this.sqcs_main_guild) {
            this.sqcs_main_guild = await this.f_platform.f_bot.guilds.fetch(this.sqcs_main_guild_id);
        }

        const users_data = await (await this.mainlvl_acc_op.cursor).find({}).toArray();

        for (let i = 0; i < users_data.length; i++) {
            const user_mainlvl_data = users_data[i];

            const nearest_num = await this.getNearestLvlNumber(user_mainlvl_data.level);
            const new_role_id = this.exp_role_id_dict[nearest_num];
            if (new_role_id === user_mainlvl_data.curr_role_id) continue;

            const member = await this.sqcs_main_guild.members.fetch(user_mainlvl_data.user_id);
            const old_role = await this.sqcs_main_guild.roles.fetch(user_mainlvl_data.curr_role_id);
            const new_role = await this.sqcs_main_guild.roles.fetch(new_role_id);

            await member.roles.remove(old_role);
            await core.sleep(1);
            await member.roles.add(new_role);

            const update_curr_role_id = {
                $set: {
                    curr_role_id: new_role_id
                }
            }
            await (await this.mainlvl_acc_op.cursor).updateOne({ user_id: user_mainlvl_data.user_id }, update_curr_role_id);
            console.log(`role edit: ${member.nickname}; old: ${old_role.name}, new: ${new_role.name}`);

            await core.sleep(4);
        }

        return self_routine();
    }

    private async getNearestLvlNumber(lvl: number) {
        return (lvl - (lvl % 5));
    }
}
