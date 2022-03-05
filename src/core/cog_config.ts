import { Client, Guild, ApplicationCommandData, InteractionReplyOptions } from "discord.js";

class CogExtension {
    bot: Client;
    in_use: boolean;
    check_failed_warning: object;
    not_in_use_warning: InteractionReplyOptions;
    error_gif: Array<string>
    
    constructor(bot) {
        this.bot = bot;
        this.in_use = true;

        this.check_failed_warning = {
            content: '[Warning] This command is unavailable!',
            ephemeral: true
        };

        // an alternative for "load" and "unload" concept from discord.py
        // actual feature is not written yet
        this.not_in_use_warning = {
            content: '[Warning] This cog is currently not in use!',
            ephemeral: true
        };

        // file to send when sth goes wrong
        this.error_gif = ['./assets/gif/error.gif'];
    };
};


class MainGuildConfig {
    guildId: string;
    guild: Guild;

    constructor(bot: Client) {
        this.guildId = '743507979369709639';
        this.guild = bot.guilds.cache.get(this.guildId);
    };

    slCmdCreater(cmd_register_list: Array<ApplicationCommandData>) {
        // register slCmds in array: "cmd_register_list"
        let commands = this.guild.commands;
        for (const cmd of cmd_register_list) commands.create(cmd);
    };

    async slCmdReset() {
        // reset slCmds registered in guild: "this.guild"
        let commands = this.guild.commands;
        commands.set([]);
    };
}


class WorkingGuildConfig {
    guildId: string;
    guild: Guild;

    constructor(bot: Client) {
        this.guildId = '790978307235512360';
        this.guild = bot.guilds.cache.get(this.guildId);
    };

    slCmdCreater(cmd_register_list) {
        // same as above
        let commands = this.guild.commands;
        for (const cmd of cmd_register_list) commands.create(cmd);
    };

    async slCmdReset() {
        // same as above
        let commands = this.guild.commands;
        commands.set([]);
    };
};



export {
    CogExtension,
    MainGuildConfig,
    WorkingGuildConfig
};
