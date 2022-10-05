"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LvlSysPlatform = void 0;
const shortcut_1 = require("../shortcut");
const reglist_1 = require("../managers/level_system/reglist");
class LvlSysPlatform extends shortcut_1.core.BasePlatform {
    constructor(f_bot) {
        super(f_bot);
        this.mainlvl_acc_op = new shortcut_1.core.MainLevelAccountOperator();
        this.bounty_acc_op = new shortcut_1.core.BountyUserAccountOperator();
        this.chat_acc_op = new shortcut_1.core.ChatAccountOperator();
        this.ama_acc_op = new shortcut_1.core.AMAUserAccountOperator();
        this.mainlvl_data_op = new shortcut_1.core.BaseMongoOperator({
            db: 'Level',
            coll: 'Data'
        });
        this.managers = [
            new reglist_1.StaticDataSetter(this),
            new reglist_1.AutoUpdateAccountManager(this),
            new reglist_1.UserInteractionsManager(this),
            new reglist_1.UserManiManager(this)
        ];
    }
}
exports.LvlSysPlatform = LvlSysPlatform;
