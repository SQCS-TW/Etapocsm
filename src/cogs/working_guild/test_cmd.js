const { CogExtension } = require('../../core/cog_config.js');
const { bot } = require('../../index.js');
const { working_guild_id, slCmdChecker } = require('./basic_verify.js');

class Test extends CogExtension {
    slCmdRegister() {
        const guild = this.bot.guilds.cache.get(working_guild_id);

        let commands = guild.commands;

        commands.create({
            name: 'pong',
            description: 'Hit the botty!'
        });
    };

    slCmdHandler(interaction) {
        if (!slCmdChecker(interaction)) {
            interaction.reply(this.check_failed_warning);
            return;
        }
        if (!this.in_use) {
            interaction.reply(this.not_in_use_warning);
            return;
        }

        if (interaction.commandName === 'pong') {
            interaction.reply({
                content: 'paaaaaaaaaaaaaaaaaaaaaaaang!',
                ephemeral: false
            });
        }
    };
};

let Test_act;

function setup(bot) {
    Test_act = new Test(bot);
    Test_act.slCmdRegister();
}

bot.on('interactionCreate', async (interaction) => Test_act.slCmdHandler(interaction));

module.exports = {
    setup
}