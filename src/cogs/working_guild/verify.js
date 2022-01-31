const working_guild_id = '790978307235512360';

function slCmdChecker(interaction) {
    if (!interaction.isCommand()) return false;
    if (interaction.guildId !== working_guild_id) return false;

    return true;
}

module.exports = {
    slCmdChecker
}
