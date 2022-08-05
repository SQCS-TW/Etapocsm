import {
    InteractionReplyOptions,
    Interaction,
    PermissionResolvable,
    ApplicationCommandData
} from "discord.js";

export type SlcmdRegisterOptions = {
    guild_id: string[],
    cmd_list: ApplicationCommandData[]
};

export class BaseManager {
    protected cmd_error: InteractionReplyOptions;
    protected perm_error: InteractionReplyOptions;
    protected error_gif: Array<string>;

    public slcmd_register_options?: SlcmdRegisterOptions;

    constructor() {
        this.cmd_error = {
            content: ':x: 【使用錯誤】這個指令現在無法使用！'
        };

        this.perm_error = {
            content: ':x: 【權限不足】你無法使用這個指令！'
        };

        // file to send when sth goes wrong
        this.error_gif = ['./assets/gif/error.gif'];
    }

    protected async checkPerm(interaction: Interaction, perm: PermissionResolvable | Array<PermissionResolvable>): Promise<boolean> {
        if (perm instanceof Array) {
            for (let i = 0; i < perm.length; i++) {
                const item = perm[i];
                if (!interaction.memberPermissions.has(item)) return false;
            }
        } else {
            if (!interaction.memberPermissions.has(perm)) return false;
        }
        return true;
    }
}
