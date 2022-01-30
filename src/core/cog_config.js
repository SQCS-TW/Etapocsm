class CogExtension {
    constructor(bot) {
        this.bot = bot;
        this.in_use = true;

        this.main_guild_id = '743507979369709639';
        this.working_guild_id = '790978307235512360';

        this.main_guild = this.bot.guilds.cache.get(this.main_guild_id);
        this.working_guild = this.bot.guilds.cache.get(this.working_guild_id);

        this.check_failed_warning = {
            content: '[Warning] This command is unavailable!',
            ephemeral: true
        };
        this.not_in_use_warning = {
            content: '[Warning] This cog is currently not in use!',
            ephemeral: true
        };
    }
}

module.exports = {
    CogExtension
}