"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AMAPlatform = void 0;
const shortcut_1 = require("../shortcut");
const reglist_1 = require("../../entities/managers/ama/reglist");
class AMAPlatform extends shortcut_1.core.BasePlatform {
    constructor(f_bot) {
        super(f_bot);
        this.mainlvl_acc_op = new shortcut_1.core.MainLevelAccountOperator();
        this.react_exp_op = new shortcut_1.core.BaseMongoOperator({
            db: 'AMA',
            coll: 'ReactionExp'
        });
        this.managers = [
            new reglist_1.ReactionExpManager(this)
        ];
    }
}
exports.AMAPlatform = AMAPlatform;
