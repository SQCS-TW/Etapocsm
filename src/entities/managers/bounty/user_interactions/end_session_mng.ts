import { core } from '../../../shortcut';
import * as session from '../../../powerup_mngs/session_mng';
import { BountyPlatform } from '../../../platforms/bounty';

import {
    DMChannel
} from 'discord.js';

import { default_end_button } from './components';


export class EndBountySessionManager extends session.SessionManager {
    constructor(f_platform: BountyPlatform) {
        const session_config: session.SessionConfig = {
            session_name: 'end-bounty-btn-cd',
            interval_data: {
                idle: 4,
                normal: 2,
                fast: 1
            }
        }

        super(f_platform, session_config);

        this.event.on('sessionExpired', async (session_data: session.SessionData) => {
            await this.doAfterExpired(session_data);
        });

        this.f_platform.f_bot.on('ready', async () => {
            await this.setupCache();
        });
    }

    private async setupCache() {
        const self_routine = (t: number) => setTimeout(async () => { await this.setupCache(); }, t * 1000);

        if (!this.cache.connected) return self_routine(1);

        let cache_data = await this.getData();

        if (!cache_data) {
            await this.writeData([]);
            cache_data = [];
        }

        const cached_user_id: string[] = [];
        if (cache_data.length !== 0) {
            for (let i = 0; i < cache_data.length; i++) {
                const user_acc = await (await this.f_platform.ongoing_op.cursor).findOne({ user_id: cache_data[i].id });

                if (!user_acc.status) {
                    cache_data.splice(i, 1);
                    continue;
                }
                cached_user_id.push(cache_data[i].id);
            }
        }

        const end_btn_data = await (await this.f_platform.end_button_op.cursor).find({}).toArray();

        for (let i = 0; i < end_btn_data.length; i++) {
            const data = end_btn_data[i];

            if (data.time.end > Date.now() + 150 * 1000) continue;
            if (cached_user_id.includes(data.user_id)) continue;

            cache_data.push({
                id: data.user_id,
                expired_date: data.time.end
            });

            core.normal_logger.debug({
                message: '[Bounty] 成員答題時段快取已建立',
                metadata: {
                    id: data.user_id,
                    expired_date: data.time.end
                }
            });
        }

        cache_data.sort((a, b) => a.expired_date - b.expired_date);
        await this.writeData(cache_data);

        return self_routine(10);
    }

    private async doAfterExpired(session_data: session.SessionData) {
        const ongoing_data = await (await this.f_platform.ongoing_op.cursor).findOne({ user_id: session_data.id });

        try {
            const channel = await this.f_platform.f_bot.channels.fetch(ongoing_data.dm_channel_id);
            if (!(channel instanceof DMChannel)) return;

            const new_button = await core.discord.getDisabledButton(default_end_button);
            const msg = await channel.messages.fetch(ongoing_data.qns_msg_id);
            await msg.edit({
                content: '已超過可回答時間',
                files: [],
                components: core.discord.compAdder([
                    [new_button]
                ])
            });
        } catch {
            core.critical_logger.error({
                message: '[Bounty] 刪除用戶進行中的問題訊息時發生錯誤了',
                metadata: {
                    ongoing_data: ongoing_data
                }
            });
        }

        const status_execute = {
            $set: {
                status: false
            }
        }
        await (await this.f_platform.ongoing_op.cursor).updateOne({ user_id: session_data.id }, status_execute);
        await (await this.f_platform.end_button_op.cursor).deleteOne({ user_id: session_data.id });

    }
}
