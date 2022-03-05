import { Interaction } from "discord.js";

const working_guild_id = '790978307235512360';

function interactionChecker(interaction: Interaction) {
    if (interaction.guildId !== working_guild_id) return false;
    return true;
};

export {
    interactionChecker
};
