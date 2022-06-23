"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaticDataSetter = void 0;
const shortcut_1 = require("../../shortcut");
const mongodb_1 = require("mongodb");
class StaticDataSetter extends shortcut_1.core.BaseManager {
    // private account_op = new core.ChatAccountOperator();
    constructor(f_platform) {
        super(f_platform);
        this.setupListener();
    }
    setupListener() {
        this.f_platform.f_bot.on('messageCreate', async (msg) => {
            if (!msg.inGuild())
                return;
            if (msg.channelId !== '743677861000380527')
                return;
            await this.messageHandler(msg);
        });
    }
    async messageHandler(msg) {
        switch (msg.content) {
            case '$setuproleiddict': {
                const role_dict = {};
                const roles = msg.guild.roles.cache;
                for (let i = 0; i <= 60; i += 5) {
                    const role_name = `LV.${i}`;
                    const role = roles.find(r => r.name === role_name);
                    role_dict[i] = role.id;
                }
                const main_dt = {
                    _id: new mongodb_1.ObjectId(),
                    type: 'exp-role-id-dict',
                    role_id_dict: role_dict
                };
                const cursor = new shortcut_1.core.BaseMongoOperator({
                    db: 'Level',
                    coll: 'Data'
                });
                await (await cursor.cursor_promise).insertOne(main_dt);
                await msg.channel.send('fin');
            }
        }
    }
}
exports.StaticDataSetter = StaticDataSetter;
