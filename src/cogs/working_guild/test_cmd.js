const { CogExtension, WorkingGuildConfig } = require('../../core/cog_config.js');
const { bot } = require('../../index.js');
const { slCmdChecker } = require('./verify.js');
const { Mongo } = require('../../core/db/mongodb.js');

class Test extends CogExtension {
    slCmdRegister() {
        const cmd_register_list = [
            {
                name: 'pong',
                description: 'Hit the botty!'
            }
        ];

        (new WorkingGuildConfig(this.bot)).slCmdCreater(cmd_register_list);
    };

    async slCmdHandler(interaction) {
        if (!slCmdChecker(interaction)) return;
        if (!this.in_use) return;

        switch (interaction.commandName) {
            case 'pong': {
                const db = new Mongo('sqcs-bot');
                const cursor = db.get_cur('Cadre');

                let data = await (await cursor).find({ _id: 0 }).toArray();

                console.log(data);
                break;
            };
        };
    };
};


let Test_act;

function promoter(bot) {
    Test_act = new Test(bot);
    Test_act.slCmdRegister();
};

bot.on('interactionCreate', async (interaction) => Test_act.slCmdHandler(interaction));

module.exports = {
    promoter
};
