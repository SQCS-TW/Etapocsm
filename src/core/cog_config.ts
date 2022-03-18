import {
    Client,
    Guild,
    ApplicationCommandData,
    InteractionReplyOptions,
    Interaction,
    PermissionResolvable
} from "discord.js";

class CogExtension {
    protected bot: Client;
    protected in_use: boolean;
    protected check_failed_warning: InteractionReplyOptions;
    protected not_in_use_warning: InteractionReplyOptions;
    protected perm_warning: InteractionReplyOptions;
    protected error_gif: Array<string>

    constructor(bot: Client) {
        this.bot = bot;
        this.in_use = true;

        this.check_failed_warning = {
            content: ':x: 【使用錯誤】這個指令現在無法使用！',
            ephemeral: true
        };

        // an alternative for "load" and "unload" concept from discord.py
        // actual feature is not written yet
        this.not_in_use_warning = {
            content: ':x: 【插件錯誤】這個插件現在無法使用！',
            ephemeral: true
        };

        this.perm_warning = {
            content: ':x: 【權限不足】你無法使用這個指令！',
            ephemeral: true
        };

        // file to send when sth goes wrong
        this.error_gif = ['./assets/gif/error.gif'];
    }

    protected checkPerm(interaction: Interaction, perm: PermissionResolvable | Array<PermissionResolvable>) {
        if (perm instanceof Array) {
            perm.forEach((item) => {
                if (!interaction.memberPermissions.has(item)) return false;
            });
        } else {
            if (!interaction.memberPermissions.has(perm)) return false;
        }
        return true;
    }
}


class BaseGuildConfig {
    protected guildId: string;
    protected guild: Guild;

    public slCmdCreater(cmd_register_list: Array<ApplicationCommandData>) {
        // register slCmds in array: "cmd_register_list"
        const commands = this.guild.commands;
        for (const cmd of cmd_register_list) commands.create(cmd);
    }

    public async slCmdReset() {
        // reset slCmds registered in guild: "this.guild"
        const commands = this.guild.commands;
        commands.set([]);
    }
}


class MainGuildConfig extends BaseGuildConfig {
    constructor(bot: Client) {
        super();
        this.guildId = '743507979369709639';
        this.guild = bot.guilds.cache.get(this.guildId);
    }
}


class WorkingGuildConfig extends BaseGuildConfig {
    constructor(bot: Client) {
        super();
        this.guildId = '790978307235512360';
        this.guild = bot.guilds.cache.get(this.guildId);
    }
}


export {
    CogExtension,
    MainGuildConfig,
    WorkingGuildConfig
};
