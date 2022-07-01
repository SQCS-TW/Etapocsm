"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BountyUserManiManager = void 0;
const user_mani_1 = require("./components/user_mani");
const shortcut_1 = require("../../shortcut");
class BountyUserManiManager extends shortcut_1.core.BaseManager {
    constructor(f_platform) {
        super(f_platform);
        this.account_op = new shortcut_1.core.BountyUserAccountOperator();
        this.ongoing_op = new shortcut_1.core.BountyUserOngoingInfoOperator();
        this.setupListener();
        this.slcmd_register_options = {
            guild_id: [shortcut_1.core.GuildId.MAIN, shortcut_1.core.GuildId.CADRE],
            cmd_list: user_mani_1.REGISTER_LIST
        };
    }
    setupListener() {
        this.f_platform.f_bot.on('interactionCreate', async (interaction) => {
            if (!interaction.inGuild())
                return;
            if (!(this.checkPerm(interaction, 'ADMINISTRATOR')))
                return;
            if (interaction.isCommand())
                await this.slcmdHandler(interaction);
        });
    }
    async slcmdHandler(interaction) {
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
exports.BountyUserManiManager = BountyUserManiManager;
