class CogExtension {
    constructor(bot) {
        this.bot = bot;
        this.in_use = true;

        this.check_failed_warning = {
            content: '[Warning] This command is unavailable!',
            ephemeral: true
        };
        this.not_in_use_warning = {
            content: '[Warning] This cog is currently not in use!',
            ephemeral: true
        };
    };
};


class MainGuildConfig {
    constructor(bot) {
        this.guildId = '743507979369709639';
        this.guild = bot.guilds.cache.get(this.guildId);
    };

    slCmdCreater(cmd_register_list) {
        let commands = this.guild.commands;
        for (const cmd of cmd_register_list) commands.create(cmd);
    };

    async slCmdReset() {
        let commands = this.guild.commands;
        commands.set([]);
    };
}


class WorkingGuildConfig {
    constructor(bot) {
        this.guildId = '790978307235512360';
        this.guild = bot.guilds.cache.get(this.guildId);
    };

    slCmdCreater(cmd_register_list) {
        let commands = this.guild.commands;
        for (const cmd of cmd_register_list) commands.create(cmd);
    };

    async slCmdReset() {
        let commands = this.guild.commands;
        commands.set([]);
    };
};



module.exports = {
    CogExtension,
    MainGuildConfig,
    WorkingGuildConfig
};
