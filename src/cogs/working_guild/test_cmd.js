const { cogExtension, workingGuildConfig } = require('../../core/cog_config.js');
const { bot } = require('../../index.js');
const { slCmdChecker } = require('./verify.js');
const { Mongo } = require('../../core/db/mongodb.js');

class Test extends CogExtension {
    slCmdRegister() {
        let commands = (new workingGuildConfig(this.bot)).guild.commands;

        const cmd_register_list = [
            {
                name: 'pong',
                description: 'Hit the botty!'
            }
        ]

        for (const cmd of cmd_register_list) commands.create(cmd);
    };

    slCmdHandler = async (interaction) => {
        if (!slCmdChecker(interaction)) {
            await interaction.reply(this.check_failed_warning);
            return;
        }
        if (!this.in_use) {
            await interaction.reply(this.not_in_use_warning);
            return;
        }

        if (interaction.commandName === 'pong') {
            const db = new Mongo('sqcs-bot');
            const cursor = db.get_cur('Cadre');

            (await cursor).find({ _id: 0 }).toArray()
                .then((callback) => console.log(callback));
        }
    };
};

let Test_act;

function promoter(bot) {
    Test_act = new Test(bot);
    Test_act.slCmdRegister();
}

bot.on('interactionCreate', async (interaction) => Test_act.slCmdHandler(interaction));

module.exports = {
    promoter
}
