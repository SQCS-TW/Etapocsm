import { MongoData } from '../../db/reglist';
import { ObjectId } from 'mongodb';
import * as core from '../../core/reglist';

export const getDefaultMainLevelAccount = async function (payload: core.DefaultDataPayload): Promise<MongoData> {
    return {
        _id: new ObjectId(),
        user_id: payload.user_id,
        create_date: Date.now(),
        total_exp: 0,
        exp_multiplier: 1,
        level: 0,
        curr_role_id: '947153762257100830'
    };
};
