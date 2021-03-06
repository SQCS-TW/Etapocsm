"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogsPlatform = void 0;
const shortcut_1 = require("../shortcut");
const reglist_1 = require("../managers/logs/reglist");
class LogsPlatform extends shortcut_1.core.BasePlatform {
    constructor(f_bot) {
        super(f_bot);
        this.managers = [
            new reglist_1.LogsManager(this)
        ];
    }
}
exports.LogsPlatform = LogsPlatform;
