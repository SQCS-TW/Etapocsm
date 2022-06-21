"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaticDataSetter = void 0;
const shortcut_1 = require("../../shortcut");
const mongodb_1 = require("mongodb");
class StaticDataSetter extends shortcut_1.core.BaseManager {
    constructor(f_platform) {
        super(f_platform);
        this.account_op = new shortcut_1.core.ChatAccountOperator();
        this.setupListener();
    }
    setupListener() {
        this.f_platform.f_bot.on('messageCreate', (msg) => __awaiter(this, void 0, void 0, function* () {
            if (!msg.inGuild())
                return;
            if (msg.channelId !== '743677861000380527')
                return;
            yield this.messageHandler(msg);
        }));
    }
    messageHandler(msg) {
        return __awaiter(this, void 0, void 0, function* () {
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
                    const cursor = new shortcut_1.core.BaseOperator({
                        db: 'Level',
                        coll: 'Data'
                    });
                    yield (yield cursor.cursor_promise).insertOne(main_dt);
                    yield msg.channel.send('fin');
                }
            }
        });
    }
}
exports.StaticDataSetter = StaticDataSetter;
