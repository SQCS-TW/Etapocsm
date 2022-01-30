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
    }
}

module.exports = {
    CogExtension
}