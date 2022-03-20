import { ButtonInteraction, CommandInteraction, SelectMenuInteraction } from 'discord.js';
import { BaseStage } from './stage';
import { BaseManager } from './manager';


class BasePlatform {
    public slcmd_list: Array<string>;
    public button_list: Array<string>;
    public dropdown_list: Array<string>;

    public f_stage: BaseStage;

    protected managers: Array<BaseManager>;

    constructor(father_stage: BaseStage) {
        this.f_stage = father_stage;
    }

    public async transferSlcmd(interaction: CommandInteraction) {
        this.managers.forEach(async (manager: any) => {
            if (manager.slcmdHandler) {
                await manager.slcmdHandler(interaction);
            }
        });
    }

    public async transferButton(interaction: ButtonInteraction) {
        this.managers.forEach(async (manager: any) => {
            if (manager.buttonHandler) await manager.buttonHandler(interaction);
        });
    }

    public async transferDropdown(interaction: SelectMenuInteraction) {
        this.managers.forEach(async (manager: any) => {
            if (manager.dropdownHandler) await manager.dropdownHandler(interaction);
        });
    }
}

export {
    BasePlatform
};
