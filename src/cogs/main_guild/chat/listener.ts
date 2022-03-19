import { Mongo, MongoDataInterface } from '../../../core/db/mongodb';
import { Collection, ObjectId } from 'mongodb';
import { bot, Etapocsm } from '../../../../main';
import { interactionChecker } from '../verify';
import { Message, GuildMember } from 'discord.js'

import {
    CogExtension,
    MainGuildConfig
} from '../../../core/cog_config';

import {
    timeAfterSecs,
    getRandomInt
} from '../../../core/utils';


class ChatListener extends CogExtension {
    constructor(bot: Etapocsm) {
        super(bot);
    }

    private async checkCooldown(author: GuildMember) {
        return false;
    }

    public async messegeHandler(msg: Message) {
        if (await this.checkCooldown(msg.member)) return;


    }
}

let ChatListener_act: ChatListener;

async function promoter(bot: Etapocsm) {
    ChatListener_act = new ChatListener(bot);
}

// bot.on('messageCreate', async (message) => {
//     await ChatListener_act.messegeHandler(message);
// });

export {
    //promoter
};
