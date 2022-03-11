import { Interaction } from "discord.js";

const WORKING_GUILD_ID = '790978307235512360';

function interactionChecker(interaction: Interaction) {
    if (interaction.guildId !== WORKING_GUILD_ID) return false;
    return true;
};

export {
    interactionChecker
};
