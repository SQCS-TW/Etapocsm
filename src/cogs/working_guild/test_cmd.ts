import { CogExtension, WorkingGuildConfig } from '../../core/cog_config.js';
import { bot } from '../../index.js';
import { slCmdChecker, buttonChecker, dropdownChecker } from './verify.js';
import { Mongo } from '../../core/db/mongodb.js';
import { Client } from 'discord.js';


class Test extends CogExtension {
    constructor(bot) {
        super(bot);
    };

    slCmdRegister() {
        const cmd_register_list = [
            {
                name: 'pong',
                description: 'Hit the botty!'
            },
            {
                name: 'butt',
                description: 'test butt'
            },
            {
                name: 'dd',
                description: 'test dd'
            }
        ];

        (new WorkingGuildConfig(this.bot)).slCmdCreater(cmd_register_list);
    };

    async slCmdHandler(interaction) {
        if (!slCmdChecker(interaction)) return;
        if (!this.in_use) return;

        switch (interaction.commandName) {
            case 'pong': {
                const cursor = await (new Mongo('Bounty')).getCur('Accounts');

                let data = await cursor.find({}).toArray();

                console.log(data);
                break;
            };

            case 'butt': {
                this.butt_msg = await interaction.reply({
                    content: 'this is butt',
                    components: this.butt_row,
                    fetchReply: true
                });

                break;
            };

            case 'dd': {
                this.drop_msg = await interaction.reply({
                    content: 'this is dd',
                    components: this.drop_row,
                    fetchReply: true
                });

                break;
            };
        };
    };

    butt_row = [
        {
            type: 1,
            components: [
                {
                    type: 2,
                    label: "Click me!",
                    style: 1,
                    custom_id: "click_one",
                    disabled: false
                },
                {
                    type: 2,
                    label: "Click mei!",
                    style: 1,
                    custom_id: "click_two",
                    disabled: false
                }
            ]
        }
    ];

    butt_msg: any = 0;

    async buttonHandler(interaction) {
        if (!buttonChecker(interaction)) return;
        if (!this.in_use) return;

        switch (interaction.component.customId) {
            case 'click_one': {
                // let edit_butt = await clone(this.butt_row);
                // edit_butt[0].components[0].disabled = true;
                // edit_butt[0].components[1].disabled = true;

                // this.butt_msg.edit({
                //     content: 'this is butt',
                //     components: edit_butt
                // });

                await this.butt_msg.delete();

                await interaction.reply('you clicked me!');

                break;
            };

            case 'click_two': {
                // let edit_butt = await clone(this.butt_row);
                // edit_butt[0].components[0].disabled = true;
                // edit_butt[0].components[1].disabled = true;

                // this.butt_msg.edit({
                //     content: 'this is butt',
                //     components: edit_butt
                // });

                await this.butt_msg.delete();

                await interaction.reply('you clicked mei!');

                break;
            };
        };
    };

    drop_row = [
        {
            type: 1,
            components: [
                {
                    type: 3,
                    placeholder: "Choose a dd",
                    custom_id: "select dd",
                    options: [
                        {
                            label: "me",
                            value: "me",
                            description: "me!",
                        },
                        {
                            label: "mei",
                            value: "mei",
                            description: "mei!",
                        }
                    ],
                    min_values: 1,
                    max_values: 1,
                    disabled: false
                }
            ]
        }
    ];

    drop_msg: any = 0;

    async dropdownHandler(interaction) {
        if (!dropdownChecker(interaction)) return;
        if (!this.in_use) return;

        switch (interaction.component.customId) {
            case 'select dd': {
                // let edit_drop = await clone(this.drop_row);
                // edit_drop[0].components[0].disabled = true;

                // this.drop_msg.edit({
                //     content: 'this is dd',
                //     components: edit_drop
                // });

                await this.drop_msg.delete();

                await interaction.reply(`you clicked ${interaction.values}!`);

                break;
            };
        };
    };
};


let Test_act;

function promoter(bot: Client) {
    Test_act = new Test(bot);
    //Test_act.slCmdRegister();
};

bot.on('interactionCreate', async (interaction) => {
    await Test_act.slCmdHandler(interaction);
    await Test_act.buttonHandler(interaction);
    await Test_act.dropdownHandler(interaction);
});

export {
    promoter
};