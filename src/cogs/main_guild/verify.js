const working_guild_id = '743507979369709639';

function slCmdChecker(interaction) {
    if (!interaction.isCommand()) return false;
    if (interaction.guildId !== working_guild_id) return false;

    return true;
};

module.exports = {
    slCmdChecker
};
