"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Etapocsm = void 0;
const discord_js_1 = require("discord.js");
const reglist_1 = require("./core/reglist");
const rest_1 = require("@discordjs/rest");
const v9_1 = require("discord-api-types/v9");
const shortcut_1 = require("./entities/shortcut");
const reglist_2 = require("./entities/platforms/reglist");
class Etapocsm extends discord_js_1.Client {
    constructor(options) {
        super(options);
        this.platforms = [
            new reglist_2.ChatExpPlatform(this),
            new reglist_2.BountyPlatform(this),
            new reglist_2.LvlSysPlatform(this),
            new reglist_2.AdministratorPlatform(this)
        ];
        this.setupListener();
    }
    setupListener() {
        this.on('ready', async () => {
            if (!this.user)
                throw new Error('Client is null.');
            reglist_1.logger.info(`${this.user.username} has logged in!`);
            // await this.registerSlcmd();
        });
    }
    async registerSlcmd() {
        const slcmd_register_list = [];
        await shortcut_1.core.asyncForEach(this.platforms, async (pf) => {
            await shortcut_1.core.asyncForEach(pf.managers, async (mng) => {
                if (!mng.SLCMD_REGISTER_LIST)
                    return;
                await shortcut_1.core.asyncForEach(mng.SLCMD_REGISTER_LIST, async (slcmd) => {
                    slcmd_register_list.push(slcmd);
                });
            });
        });
        const BOT_TOKEN = process.env.BOT_TOKEN;
        const BOT_ID = process.env.BOT_ID;
        const MAIN_GUILD_ID = process.env.SQCS_MAIN_GUILD_ID;
        const rest = new rest_1.REST({ version: '10' }).setToken(BOT_TOKEN);
        await rest.put(v9_1.Routes.applicationGuildCommands(BOT_ID, MAIN_GUILD_ID), { body: [] }); // reset slcmd
        if (slcmd_register_list.length !== 0) {
            await rest.put(v9_1.Routes.applicationGuildCommands(BOT_ID, MAIN_GUILD_ID), { body: slcmd_register_list });
            reglist_1.logger.info('SLCMD Registered!');
        }
    }
}
exports.Etapocsm = Etapocsm;
