"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatExpPlatform = void 0;
const shortcut_1 = require("../shortcut");
const reglist_1 = require("../managers/chat_exp/reglist");
class ChatExpPlatform extends shortcut_1.core.BasePlatform {
    constructor(f_bot) {
        super(f_bot);
        this.managers = [
            new reglist_1.ChatListener(this)
        ];
    }
}
exports.ChatExpPlatform = ChatExpPlatform;
