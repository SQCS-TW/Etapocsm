/* eslint-disable no-inner-declarations */
import { Message } from 'discord.js';
import { LvlSysPlatform } from '../../platforms/level_system';
import { core } from '../../shortcut';


export class StaticDataSetter extends core.BaseManager {
    public f_platform: LvlSysPlatform;

    constructor(f_platform: LvlSysPlatform) {
        super();
        this.f_platform = f_platform;

        this.setupListener();
    }

    private setupListener() {
        this.f_platform.f_bot.on('messageCreate', async (msg) => {
            if (!msg.inGuild()) return;
            if (msg.channelId !== '743677861000380527') return;
            await this.messageHandler(msg);
        });
    }

    private async messageHandler(msg: Message) {
        switch (msg.content) {
            case '$setuproleiddict': {
                const role_dict = {};
                const roles = msg.guild.roles.cache;
                for (let i = 0; i <= 60; i += 5) {
                    const role_name = `LV.${i}`
                    const role = roles.find(r => r.name === role_name);
                    role_dict[i] = role.id;
                }

                const main_dt = {
                    type: 'exp-role-id-dict',
                    role_id_dict: role_dict
                }

                const cursor = new core.BaseMongoOperator({
                    db: 'Level',
                    coll: 'Data'
                });

                await (await cursor.cursor).insertOne(main_dt);
                await msg.channel.send('fin');
            }
        }
    }
}