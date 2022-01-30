const working_guild_id = '790978307235512360';

function slCmdChecker(interaction) {
    if (interaction.guildId !== working_guild_id) {
        console.log(interaction.guildId);
        console.log(working_guild_id);
        return false;
    }
    if (!interaction.isCommand()) {
        console.log(interaction.isCommand());
        return false;
    }

    return true;
}

module.exports = {
    working_guild_id,
    slCmdChecker
}