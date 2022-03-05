import { Interaction } from "discord.js";

const main_guild_id = '743507979369709639';

function interactionChecker(interaction: Interaction) {
    if (interaction.guildId !== main_guild_id) return false;
    return true;
};

export {
    interactionChecker
};
