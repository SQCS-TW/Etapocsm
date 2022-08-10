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
            new reglist_2.AdministratorPlatform(this),
            new reglist_2.LogsPlatform(this)
        ];
        this.setupListener();
    }
    setupListener() {
        this.on('ready', async () => {
            if (!this.user)
                throw new Error('Client is null.');
            reglist_1.normal_logger.info(`${this.user.username} has logged in!`);
        });
    }
    async registerSlcmd(guild_id) {
        const slcmd_register_list = [];
        await shortcut_1.core.asyncForEach(this.platforms, async (pf) => {
            await shortcut_1.core.asyncForEach(pf.managers, async (mng) => {
                const reg_options = mng?.slcmd_register_options;
                if (!reg_options)
                    return;
                if (!reg_options.guild_id.includes(guild_id))
                    return;
                await shortcut_1.core.asyncForEach(reg_options.cmd_list, async (slcmd) => {
                    slcmd_register_list.push(slcmd);
                });
            });
        });
        const BOT_TOKEN = process.env.BOT_TOKEN;
        const BOT_ID = process.env.BOT_ID;
        const rest = new rest_1.REST({ version: '9' }).setToken(BOT_TOKEN);
        await rest.put(v9_1.Routes.applicationGuildCommands(BOT_ID, guild_id), { body: [] });
        if (slcmd_register_list.length !== 0) {
            await rest.put(v9_1.Routes.applicationGuildCommands(BOT_ID, guild_id), { body: slcmd_register_list });
            reglist_1.normal_logger.info(`Slcmd of guild ${guild_id} registered!`);
        }
    }
}
exports.Etapocsm = Etapocsm;
