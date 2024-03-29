import { core, db } from '../../shortcut';
import { AMAPlatform } from '../../platforms/ama';
import { StageChannel, GuildMember } from 'discord.js';

export class ParticipantExpManager extends core.BaseManager {
    public f_platform: AMAPlatform;

    private readonly ama_stage_channel_id = '947878783099224104';
    private readonly mins_in_mili_secs = 60 * 1000;

    constructor(f_platform: AMAPlatform) {
        super();
        this.f_platform = f_platform;

        this.setupListener();
    }

    private setupListener() {
        this.f_platform.f_bot.on('ready', async () => {
            await this.giveParticipantExp()
        });
    }

    private async giveParticipantExp() {
        const self_routine = (min: number) => setTimeout(async () => { await this.giveParticipantExp() }, min * this.mins_in_mili_secs);
        
        const stage_channel = await this.f_platform.f_bot.channels.fetch(this.ama_stage_channel_id);
        if (!(stage_channel instanceof StageChannel)) return self_routine(2);

        let lecturer_found = false;
        let member_count = 0;
        stage_channel.members.forEach((member: GuildMember) => {
            member_count++;
            if (core.discord.memberHasRole(member, ['AMA 講師'])) lecturer_found = true;
        });

        if (!lecturer_found) return self_routine(2);
        if (member_count < 5) return self_routine(2);

        
        await core.asyncForEach(Array.from(stage_channel.members.values()), async (member: GuildMember) => {
            const user_lvl_data = await (await this.f_platform.mainlvl_acc_op.cursor).findOne({ user_id: member.id });

            const periodic_exp = 5;
            const exp_multiplier = user_lvl_data?.exp_multiplier ?? 1;
            const delta_exp = Math.round(periodic_exp * exp_multiplier);
            const update_result = await this.f_platform.ama_acc_op.addExp(member.id, delta_exp);
    
            if (update_result.status === db.StatusCode.WRITE_DATA_ERROR) return core.critical_logger.error({
                message: `[AMA] ${update_result.message}`,
                metadata: {
                    player_id: member.id,
                    delta_exp: delta_exp,
                    error_code: db.StatusCode.WRITE_DATA_ERROR
                }
            });
            
            try {
                await member.send(`🥳｜你獲得了 ${delta_exp} 點經驗值`);
            } catch { /* ignore */ }
            
        });

        return self_routine(10);
    }
}