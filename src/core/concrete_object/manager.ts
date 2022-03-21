import { BasePlatform } from './platform';

import {
    ApplicationCommandData,
    InteractionReplyOptions,
    Interaction,
    PermissionResolvable,
    Message
} from "discord.js";


class BaseManager {
    public f_platform: BasePlatform;

    protected slcmd_reglist: Array<ApplicationCommandData>;

    protected cmd_error: InteractionReplyOptions;
    protected perm_error: InteractionReplyOptions;
    protected error_gif: Array<string>;

    constructor(father_platform: BasePlatform) {
        this.f_platform = father_platform;

        this.cmd_error = {
            content: ':x: 【使用錯誤】這個指令現在無法使用！'
        };

        this.perm_error = {
            content: ':x: 【權限不足】你無法使用這個指令！'
        };

        // file to send when sth goes wrong
        this.error_gif = ['./assets/gif/error.gif'];
    }

    public async registerSlcmd(): Promise<void> {
        const commands_mng = this.f_platform.f_stage.guild.commands;
        for (const slcmd of this.slcmd_reglist) commands_mng.create(slcmd);
    }

    public async resetAllSlcmd(): Promise<void> {
        // reset slCmds registered in guild: "this.guild"
        const commands_mng = this.f_platform.f_stage.guild.commands;
        commands_mng.set([]);
    }

    protected async checkPerm(interaction: Interaction, perm: PermissionResolvable | Array<PermissionResolvable>): Promise<boolean> {
        if (perm instanceof Array) {
            perm.forEach((item) => {
                if (!interaction.memberPermissions.has(item)) return false;
            });
        } else {
            if (!interaction.memberPermissions.has(perm)) return false;
        }
        return true;
    }
}

class BaseListener {
    public f_platform: BasePlatform;

    constructor(father_platform: BasePlatform) {
        this.f_platform = father_platform;
    }
}


export {
    BaseManager,
    BaseListener
};
