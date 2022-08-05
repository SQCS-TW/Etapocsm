"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BountyPlatform = void 0;
const shortcut_1 = require("../shortcut");
const reglist_1 = require("../managers/bounty/reglist");
class BountyPlatform extends shortcut_1.core.BasePlatform {
    constructor(f_bot) {
        super(f_bot);
        this.account_op = new shortcut_1.core.BountyUserAccountOperator();
        this.ongoing_op = new shortcut_1.core.BountyUserOngoingInfoOperator();
        this.qns_op = new shortcut_1.core.BountyQnsDBOperator();
        this.mainlvl_acc_op = new shortcut_1.core.MainLevelAccountOperator();
        this.start_button_op = new shortcut_1.core.BaseMongoOperator({
            db: 'Bounty',
            coll: 'StartButtonPipeline'
        });
        this.db_cache_operator = new shortcut_1.core.BaseMongoOperator({
            db: 'Bounty',
            coll: 'StorjQnsDBCache'
        });
        this.confirm_start_button_op = new shortcut_1.core.BaseMongoOperator({
            db: 'Bounty',
            coll: 'StartButtonPipeline'
        });
        this.end_button_op = new shortcut_1.core.BaseMongoOperator({
            db: 'Bounty',
            coll: 'EndButtonPipeline'
        });
        this.dropdown_op = new shortcut_1.core.BaseMongoOperator({
            db: 'Bounty',
            coll: 'DropdownPipeline'
        });
        this.managers = [
            new reglist_1.BountyQnsDBManager(this),
            new reglist_1.BountyAccountManager(this),
            new reglist_1.StartBountyManager(this),
            new reglist_1.ConfirmStartBountyManager(this),
            new reglist_1.EndBountyManager(this),
            new reglist_1.SelectBountyAnswerManager(this),
            new reglist_1.EndBountySessionManager(this),
            new reglist_1.BountyUserManiManager(this),
            new reglist_1.BountyUIManager(this),
            new reglist_1.AutoManager(this)
        ];
    }
}
exports.BountyPlatform = BountyPlatform;
