import { MongoData } from '../db/reglist';
import { ObjectId } from 'mongodb';

const getDefaultChatAccount = async function (user_id: string): Promise<MongoData> {
    return {
        _id: new ObjectId(),
        user_id: user_id,
        exp: 0,
        cooldown: -1
    };
};

export {
    getDefaultChatAccount
};
