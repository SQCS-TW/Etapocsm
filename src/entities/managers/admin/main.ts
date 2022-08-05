import { CommandInteraction, Message } from 'discord.js';
import { core } from '../../shortcut';
import { AdministratorPlatform } from '../../platforms/admin';


export class AdministratorManager extends core.BaseManager {
    public f_platform: AdministratorPlatform;
    constructor(f_platform: AdministratorPlatform) {
        super();
        this.f_platform = f_platform;
        
        this.setupListener();

        this.slcmd_register_options = {
            guild_id: [core.GuildId.MAIN, core.GuildId.CADRE],
            cmd_list: [
                {
                    name: 'ping',
                    description: '戳一下機器人'
                }
            ]
        };
    }

    private setupListener() {
        this.f_platform.f_bot.on('messageCreate', async (msg) => {
            if (msg.member?.permissions?.any('ADMINISTRATOR')) await this.messageHandler(msg);
        });

        this.f_platform.f_bot.on('interactionCreate', async (interaction) => {
            if (interaction.isCommand()) await this.slcmdHandler(interaction);
        });
    }

    private async messageHandler(msg: Message) {
        switch (msg.content) {
            case 'e:REGISTER-SLASH-COMMAND': {
                await this.f_platform.f_bot.registerSlcmd(msg.guildId);
                await msg.reply(`slcmd of guild ${msg.guildId} registered!`);
                break;
            }

            case 'e:TempUpdateDb': {
                const mainlvl_acc_op = new core.MainLevelAccountOperator();

                const update = {
                    $set: {
                        exp_multiplier: 1
                    }
                };
                await (await mainlvl_acc_op.cursor).updateMany({}, update);
                await msg.reply('fin.');
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