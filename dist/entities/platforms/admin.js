"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdministratorPlatform = void 0;
const shortcut_1 = require("../shortcut");
const reglist_1 = require("../managers/admin/reglist");
class AdministratorPlatform extends shortcut_1.core.BasePlatform {
    constructor(f_bot) {
        super(f_bot);
        this.managers = [
            new reglist_1.AdministratorManager(this)
        ];
    }
}
exports.AdministratorPlatform = AdministratorPlatform;
