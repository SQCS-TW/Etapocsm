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
exports.BountyPlatform = void 0;
const shortcut_1 = require("../shortcut");
const reglist_1 = require("../managers/bounty/reglist");
class BountyPlatform extends shortcut_1.core.BasePlatform {
    constructor(f_bot) {
        super(f_bot);
    }
    activateManagers(this_platform) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.addManagers(this_platform);
        });
    }
    addManagers(this_platform) {
        return __awaiter(this, void 0, void 0, function* () {
            this.managers = [
                new reglist_1.BountyQnsDBManager(this_platform),
                new reglist_1.BountyAccountManager(this_platform),
                new reglist_1.BountyEventManager(this_platform)
            ];
        });
    }
}
exports.BountyPlatform = BountyPlatform;
