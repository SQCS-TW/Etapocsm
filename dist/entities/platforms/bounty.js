"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BountyPlatform = void 0;
const shortcut_1 = require("../shortcut");
const reglist_1 = require("../managers/bounty/reglist");
class BountyPlatform extends shortcut_1.core.BasePlatform {
    constructor(f_bot) {
        super(f_bot);
        this.managers = [
            new reglist_1.BountyQnsDBManager(this),
            new reglist_1.BountyAccountManager(this),
            new reglist_1.BountyEventManager(this),
            new reglist_1.BountyEventAutoManager(this),
            new reglist_1.BountyUserManiManager(this)
        ];
    }
}
exports.BountyPlatform = BountyPlatform;
