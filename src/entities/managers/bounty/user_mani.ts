import { CommandInteraction } from 'discord.js';
import { REGISTER_LIST } from './components/user_mani';
import { core } from '../../shortcut';


export class BountyUserManiManager extends core.BaseManager {
    private account_op = new core.BountyUserAccountOperator();
    private ongoing_op = new core.BountyUserOngoingInfoOperator();

    constructor(f_platform: core.BasePlatform) {
        super(f_platform);

        this.setupListener();

        this.slcmd_register_options = {
            guild_id: [core.GuildId.MAIN, core.GuildId.CADRE],
            cmd_list: REGISTER_LIST
        };
    }

    private setupListener() {
        this.f_platform.f_bot.on('interactionCreate', async (interaction) => {
            if (!interaction.inGuild()) return;
            if (!(this.checkPerm(interaction, 'ADMINISTRATOR'))) return;
            if (interaction.isCommand()) await this.slcmdHandler(interaction);
        });
    }

    private async slcmdHandler(interaction: CommandInteraction) {
        switch (interaction.commandName) {
            case 'mani-bounty-auth': {
                await interaction.deferReply();
                const user_id = interaction.options.getString('id');
                const new_auth = interaction.options.getBoolean('new-auth');

                const result = await this.account_op.setAuth(user_id, new_auth);
                return await interaction.editReply(result.message);
            }

            case 'mani-bounty-status': {
                await interaction.deferReply();
                const user_id = interaction.options.getString('id');
                const new_status = interaction.options.getBoolean('new-status');

                const result = await this.ongoing_op.setStatus(user_id, new_status);
                return await interaction.editReply(result.message);
            }
        }
    }
}