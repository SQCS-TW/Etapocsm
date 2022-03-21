import { MongoData } from '../db/reglist';
import { ObjectId } from 'mongodb';
import { timeAfterSecs } from '../core/reglist';

const getDefaultInterAppli = async function (user_id: string, type: string, due_after_seconds: number): Promise<MongoData> {
    return {
        _id: new ObjectId(),
        user_id: user_id,
        type: type,
        due_time: (await timeAfterSecs(due_after_seconds))
    };
};

export {
    getDefaultInterAppli
};
