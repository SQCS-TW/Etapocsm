"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LvlSysPlatform = void 0;
const shortcut_1 = require("../shortcut");
const reglist_1 = require("../managers/level_system/reglist");
class LvlSysPlatform extends shortcut_1.core.BasePlatform {
    constructor(f_bot) {
        super(f_bot);
        this.managers = [
            new reglist_1.StaticDataSetter(this),
            new reglist_1.AutoUpdateAccountManager(this)
        ];
    }
}
exports.LvlSysPlatform = LvlSysPlatform;
