"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AMAPlatform = void 0;
const shortcut_1 = require("../shortcut");
class AMAPlatform extends shortcut_1.core.BasePlatform {
    constructor(f_bot) {
        super(f_bot);
        this.managers = [];
    }
}
exports.AMAPlatform = AMAPlatform;
