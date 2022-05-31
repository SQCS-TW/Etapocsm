import { MongoData } from '../db/reglist';
import { ObjectId } from 'mongodb';
import * as core from '../core/reglist';

const getDefaultBountyAccount = async function (payload: core.DefaultDataPayload): Promise<MongoData> {
    return {
        _id: new ObjectId(),
        user_id: payload.user_id,
        exp: 0,
        stamina: {
            regular: 3,
            extra: 0
        },
        active: false,
        record: {
            total_qns: {
                easy: 0,
                medium: 0,
                hard: 0
            },
            correct_qns: {
                easy: 0,
                medium: 0,
                hard: 0
            }
        }
    };
};

export {
    getDefaultBountyAccount
};
