import { MongoData } from '../../db/reglist';
import { ObjectId } from 'mongodb';
import * as core from '../../core/reglist';

export const getDefaultMainLevelAccount = async function (payload: core.DefaultDataPayload): Promise<MongoData> {
    return {
        _id: new ObjectId(),
        user_id: payload.user_id,
        create_date: Date.now(),
        total_exp: 0,
        level: 0,
        curr_role: '947153762257100830',
        vice_exp_record: {}
    };
};
