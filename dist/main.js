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
require('dotenv').config();
const bot_1 = require("./bot");
const discord_js_1 = require("discord.js");
const allIntents = new discord_js_1.Intents(32767);
const bot = new bot_1.Etapocsm({
    intents: allIntents
});
process.on('uncaughtException', (data) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(data);
}));
bot.login(process.env.BOT_TOKEN);
