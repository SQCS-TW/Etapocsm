import { core } from '../../../shortcut';
import * as session from '../../../powerup_mngs/session_mng';

import {
    DMChannel
} from 'discord.js';

import { default_end_button } from './components';


export class EndBountySessionManager extends session.SessionManager {

    private ongoing_op = new core.BountyUserOngoingInfoOperator();
    private end_button_op = new core.BaseMongoOperator({
        db: 'Bounty',
        coll: 'EndButtonPipeline'
    });

    constructor(f_platform: core.BasePlatform) {
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

        if (cache_data === null) {
            await this.writeData([]);
            cache_data = await this.getData();
        }

        const cached_user_id: string[] = [];
        if (cache_data.length !== 0) {
            for (let i = 0; i < cache_data.length; i++) {
                const user_acc = await (await this.ongoing_op.cursor_promise).findOne({ user_id: cache_data[i].id });

                if (!user_acc.status) {
                    cache_data.splice(i, 1);
                    continue;
                }
                cached_user_id.push(cache_data[i].id);
            }
        }

        const end_btn_data = await (await this.end_button_op.cursor_promise).find({}).toArray();

        for (let i = 0; i < end_btn_data.length; i++) {
            const data = end_btn_data[i];

            if (data.time.end > Date.now() + 150 * 1000) continue;
            if (await core.isItemInArray(data.user_id, cached_user_id)) continue;

            cache_data.push({
                id: data.user_id,
                expired_date: data.time.end
            });

            console.log('cache pushed', {
                id: data.user_id,
                expired_date: data.time.end
            });
        }

        cache_data.sort((a, b) => a.expired_date - b.expired_date);
        await this.writeData(cache_data);

        return self_routine(10);
    }

    private async doAfterExpired(session_data: session.SessionData) {
        const end_btn_data = await (await this.end_button_op.cursor_promise).findOne({ user_id: session_data.id });
        if (end_btn_data) {
            const channel = await this.f_platform.f_bot.channels.fetch(end_btn_data.channel_id);
            if (!(channel instanceof DMChannel)) return;

            try {
                const msg = await channel.messages.fetch(end_btn_data.msg_id);
                const new_button = await core.discord.getDisabledButton(default_end_button);
                await msg.edit({
                    content: '已超過可回答時間',
                    files: [],
                    components: core.discord.compAdder([
                        [new_button]
                    ])
                });
            } catch {
                console.log(`err deleting msg ${end_btn_data.msg_id}`);
            }

            const status_execute = {
                $set: {
                    status: false
                }
            }
            await (await this.ongoing_op.cursor_promise).updateOne({ user_id: session_data.id }, status_execute);
            await (await this.end_button_op.cursor_promise).deleteOne({ user_id: session_data.id });
        }
        return;
    }
}
