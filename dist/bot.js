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
exports.Etapocsm = void 0;
const discord_js_1 = require("discord.js");
const reglist_1 = require("./entities/platforms/reglist");
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
class Etapocsm extends discord_js_1.Client {
    constructor(options) {
        super(options);
        this.setupListener();
    }
    setupListener() {
        this.on('ready', () => __awaiter(this, void 0, void 0, function* () {
            if (!this.user)
                throw new Error('Client is null.');
            console.log(`${this.user.username} has logged in!`);
            // activate = add + invoke
            yield this.activatePlatforms(this);
            yield this.registerSlcmd();
        }));
    }
    activatePlatforms(this_bot) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.addPlatforms(this_bot);
            yield this.invokePlatforms();
        });
    }
    addPlatforms(this_bot) {
        return __awaiter(this, void 0, void 0, function* () {
            this.platforms = [
                new reglist_1.LvlSysPlatform(this_bot),
                new reglist_1.BountyPlatform(this_bot)
            ];
        });
    }
    invokePlatforms() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.platforms.forEach((platform) => __awaiter(this, void 0, void 0, function* () {
                    yield platform.activateManagers(platform);
                }));
            }
            catch (err) {
                throw new Error(`Error when invoking plats.\n msg: ${err}`);
            }
        });
    }
    registerSlcmd() {
        return __awaiter(this, void 0, void 0, function* () {
            const slcmd_register_list = [];
            this.platforms.forEach((pf) => {
                pf.managers.forEach((mg) => {
                    if (!mg.SLCMD_REGISTER_LIST)
                        return;
                    mg.SLCMD_REGISTER_LIST.forEach((slcmd) => {
                        slcmd_register_list.push(slcmd);
                    });
                });
            });
            console.log(slcmd_register_list);
            const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);
            yield rest.put(Routes.applicationGuildCommands(process.env.BOT_ID, process.env.SQCS_MAIN_GUILD_ID), { body: slcmd_register_list });
            console.log('slcmd registered!');
        });
    }
}
exports.Etapocsm = Etapocsm;
