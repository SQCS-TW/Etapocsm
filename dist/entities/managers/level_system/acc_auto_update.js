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
        this.mins_in_mili_secs = 60 * 1000;
        this.cache_path = './cache/bounty/end_btn.json';
        this.mainlvlacc_op = new shortcut_1.core.MainLevelAccountOperator();
        this.json_op = new shortcut_1.core.jsonOperator();
        this.setupListener();
    }
    setupListener() {
        return __awaiter(this, void 0, void 0, function* () {
            this.f_platform.f_bot.on('ready', () => __awaiter(this, void 0, void 0, function* () {
                yield this.updateTotalExp();
            }));
        });
    }
    updateTotalExp() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('once update exp');
            if (this.json_op === undefined)
                console.log('no');
            else
                console.log('yes');
            const data = yield this.json_op.readFile(this.cache_path);
            console.log(data);
            return setTimeout(() => __awaiter(this, void 0, void 0, function* () { yield this.updateTotalExp(); }), 2 * 1000);
        });
    }
    updateCurrLevel() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('once update curr lvl');
            return setTimeout(() => __awaiter(this, void 0, void 0, function* () { yield this.updateCurrLevel(); }), 5 * 1000);
        });
    }
}
exports.AutoUpdateAccountManager = AutoUpdateAccountManager;
