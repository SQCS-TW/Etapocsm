import { Interaction } from "discord.js";

const MAIN_GUILD_ID = '743507979369709639';

function interactionChecker(interaction: Interaction) {
    if (interaction.guildId !== MAIN_GUILD_ID) return false;
    return true;
}

export {
    interactionChecker
};
