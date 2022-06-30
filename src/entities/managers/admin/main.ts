/* eslint-disable no-inner-declarations */
import { CommandInteraction, Message } from 'discord.js';
import { core } from '../../shortcut';


export class AdministratorManager extends core.BaseManager {
    // private account_op = new core.ChatAccountOperator();

    constructor(f_platform: core.BasePlatform) {
        super(f_platform);

        this.setupListener();

        this.SLCMD_REGISTER_LIST = [
            {
                name: 'ping',
                description: '戳一下機器人'
            }
        ];
    }

    private setupListener() {
        this.f_platform.f_bot.on('messageCreate', async (msg) => {
            if (msg.member.permissions.any('ADMINISTRATOR')) await this.messageHandler(msg);
        });

        this.f_platform.f_bot.on('interactionCreate', async (interaction) => {
            if (interaction.isCommand()) await this.slcmdHandler(interaction);
        });
    }

    private async messageHandler(msg: Message) {
        switch(msg.content) {
            case 'e:REGISTER-SLASH-COMMAND': {
                await this.f_platform.f_bot.registerSlcmd();
                await msg.reply('slcmd registered!');
            }
        }
    }

    private async slcmdHandler(interaction: CommandInteraction) {
        switch (interaction.commandName) {
            case 'ping': {
                await interaction.deferReply();
                return await interaction.editReply(
                    `🏓 Latency is ${Date.now() - interaction.createdTimestamp}ms.\n` +
                    `API Latency is ${Math.round(this.f_platform.f_bot.ws.ping)}ms.`
                );
            }
        }
    }
}