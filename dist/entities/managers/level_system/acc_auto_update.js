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
exports.AutoUpdateAccountManager = void 0;
const shortcut_1 = require("../../shortcut");
class AutoUpdateAccountManager extends shortcut_1.core.BaseManager {
    constructor(f_platform) {
        super(f_platform);
        // operators
        this.mainlvl_acc_op = new shortcut_1.core.MainLevelAccountOperator();
        this.bounty_acc_op = new shortcut_1.core.BountyUserAccountOperator();
        this.chat_acc_op = new shortcut_1.core.ChatAccountOperator();
        this.mainlvl_data_op = new shortcut_1.core.BaseOperator({
            db: 'Level',
            coll: 'Data'
        });
        // constants
        this.mins_in_mili_secs = 60 * 1000;
        this.sqcs_main_guild_id = '743507979369709639';
        // data to be cached
        this.lvl_exp_dict = undefined;
        this.exp_role_id_dict = undefined;
        this.sqcs_main_guild = undefined;
        this.setupListener();
    }
    setupListener() {
        return __awaiter(this, void 0, void 0, function* () {
            this.f_platform.f_bot.on('ready', () => __awaiter(this, void 0, void 0, function* () {
                yield this.updateTotalExp();
                yield this.updateCurrLevel();
                yield this.updateGuildRole();
            }));
            this.f_platform.f_bot.on('rateLimit', (rateLimitData) => __awaiter(this, void 0, void 0, function* () {
                console.log('**RATE LIMITED**:', rateLimitData);
            }));
        });
    }
    updateTotalExp() {
        return __awaiter(this, void 0, void 0, function* () {
            const self_routine = () => setTimeout(() => __awaiter(this, void 0, void 0, function* () { yield this.updateTotalExp(); }), 2 * this.mins_in_mili_secs);
            const users_data = yield (yield this.mainlvl_acc_op.cursor_promise).find({}).toArray();
            const other_acc_cursors = [
                this.bounty_acc_op,
                this.chat_acc_op
            ];
            for (let i = 0; i < users_data.length; i++) {
                const user_mainlvl_data = users_data[i];
                let user_exps = 0;
                for (let j = 0; j < other_acc_cursors.length; j++) {
                    const cursor = other_acc_cursors[j];
                    const user_acc_data = yield (yield cursor.cursor_promise).findOne({ user_id: user_mainlvl_data.user_id });
                    if (!user_acc_data)
                        continue;
                    user_exps += user_acc_data.exp;
                }
                const update_exp = {
                    $set: {
                        total_exp: user_exps
                    }
                };
                yield (yield this.mainlvl_acc_op.cursor_promise).updateOne({ user_id: user_mainlvl_data.user_id }, update_exp);
            }
            return self_routine();
        });
    }
    updateCurrLevel() {
        return __awaiter(this, void 0, void 0, function* () {
            const self_routine = () => setTimeout(() => __awaiter(this, void 0, void 0, function* () { yield this.updateCurrLevel(); }), 2 * this.mins_in_mili_secs);
            const users_data = yield (yield this.mainlvl_acc_op.cursor_promise).find({}).toArray();
            for (let i = 0; i < users_data.length; i++) {
                const user_mainlvl_data = users_data[i];
                const new_lvl = yield this.getUserLevel(user_mainlvl_data.total_exp);
                if (new_lvl === user_mainlvl_data.level)
                    continue;
                const update_lvl = {
                    $set: {
                        level: new_lvl
                    }
                };
                yield (yield this.mainlvl_acc_op.cursor_promise).updateOne({ user_id: user_mainlvl_data.user_id }, update_lvl);
                yield this.sendUserLevelUpdate(user_mainlvl_data.user_id, user_mainlvl_data.level, new_lvl);
            }
            return self_routine();
        });
    }
    getUserLevel(exp) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.lvl_exp_dict === undefined) {
                const lvl_exp_data = yield (yield this.mainlvl_data_op.cursor_promise).findOne({ type: 'level-exp-dict' });
                this.lvl_exp_dict = lvl_exp_data.exp_dict;
            }
            let cur_lvl = 0;
            while (cur_lvl <= 60) {
                if (cur_lvl === 60)
                    break;
                else if (this.lvl_exp_dict[cur_lvl] <= exp && exp < this.lvl_exp_dict[cur_lvl + 1])
                    break;
                cur_lvl++;
            }
            return cur_lvl;
        });
    }
    sendUserLevelUpdate(user_id, old_lvl, new_lvl) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.sqcs_main_guild === undefined) {
                this.sqcs_main_guild = yield this.f_platform.f_bot.guilds.fetch(this.sqcs_main_guild_id);
            }
            const member = yield this.sqcs_main_guild.members.fetch(user_id);
            try {
                if (old_lvl < new_lvl) {
                    yield member.send(`恭喜！你升級啦！\nLV.${old_lvl} -> LV.${new_lvl}`);
                }
                else {
                    yield member.send(`可惜，你降級了...\nLV.${old_lvl} -> LV.${new_lvl}`);
                }
            }
            catch (_a) {
                return;
            }
        });
    }
    updateGuildRole() {
        return __awaiter(this, void 0, void 0, function* () {
            const self_routine = () => setTimeout(() => __awaiter(this, void 0, void 0, function* () { yield this.updateGuildRole(); }), 3 * this.mins_in_mili_secs);
            if (this.exp_role_id_dict === undefined) {
                const exp_role_id_data = yield (yield this.mainlvl_data_op.cursor_promise).findOne({ type: 'exp-role-id-dict' });
                this.exp_role_id_dict = exp_role_id_data.role_id_dict;
            }
            if (this.sqcs_main_guild === undefined) {
                this.sqcs_main_guild = yield this.f_platform.f_bot.guilds.fetch(this.sqcs_main_guild_id);
            }
            const users_data = yield (yield this.mainlvl_acc_op.cursor_promise).find({}).toArray();
            for (let i = 0; i < users_data.length; i++) {
                const user_mainlvl_data = users_data[i];
                const nearest_num = yield this.getNearestLvlNumber(user_mainlvl_data.level);
                const new_role_id = this.exp_role_id_dict[nearest_num];
                if (new_role_id === user_mainlvl_data.curr_role_id)
                    continue;
                const member = yield this.sqcs_main_guild.members.fetch(user_mainlvl_data.user_id);
                const old_role = yield this.sqcs_main_guild.roles.fetch(user_mainlvl_data.curr_role_id);
                const new_role = yield this.sqcs_main_guild.roles.fetch(new_role_id);
                yield member.roles.remove(old_role);
                yield shortcut_1.core.sleep(1);
                yield member.roles.add(new_role);
                const update_curr_role_id = {
                    $set: {
                        curr_role_id: new_role_id
                    }
                };
                yield (yield this.mainlvl_acc_op.cursor_promise).updateOne({ user_id: user_mainlvl_data.user_id }, update_curr_role_id);
                console.log(`role edit: ${member.nickname}; old: ${old_role.name}, new: ${new_role.name}`);
                yield shortcut_1.core.sleep(4);
            }
            return self_routine();
        });
    }
    getNearestLvlNumber(lvl) {
        return __awaiter(this, void 0, void 0, function* () {
            return (lvl - (lvl % 5));
        });
    }
}
exports.AutoUpdateAccountManager = AutoUpdateAccountManager;
