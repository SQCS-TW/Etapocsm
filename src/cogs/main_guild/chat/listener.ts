import { Mongo, MongoDataInterface } from '../../../core/db/mongodb';
import { Collection, ObjectId } from 'mongodb';
import { bot } from '../../../index';
import { interactionChecker } from '../verify';
import { Client, Message, GuildMember } from 'discord.js'

import {
    CogExtension,
    MainGuildConfig
} from '../../../core/cog_config';

import {
    timeAfterSecs,
    getRandomInt
} from '../../../core/utils';


class ChatListener extends CogExtension {
    constructor(bot: Client) {
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

function promoter(bot: Client) {
    ChatListener_act = new ChatListener(bot);
}

bot.on('messageCreate', async (message) => {
    await ChatListener_act.messegeHandler(message);
});

export {
    promoter
};
