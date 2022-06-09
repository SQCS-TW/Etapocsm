import { MongoData } from '../../db/reglist';
import { ObjectId } from 'mongodb';
import * as core from '../../core/reglist';

const getDefaultChatAccount = async function (payload: core.DefaultDataPayload): Promise<MongoData> {
    return {
        _id: new ObjectId(),
        user_id: payload.user_id,
        exp: 0,
        cooldown: -1
    };
};

export {
    getDefaultChatAccount
};
