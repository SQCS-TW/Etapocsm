import { MongoData } from '../../db/reglist';
import { ObjectId } from 'mongodb';
import * as core from '../../core/reglist';

const getDefaultUserOngoingData = async function (payload: core.DefaultDataPayload): Promise<MongoData> {
    return {
        _id: new ObjectId(),
        user_id: payload.user_id,
        status: false,
        qns_thread: {
            easy: [],
            medium: [],
            hard: []
        },
        stamina: {
            regular: 3,
            extra: 0
        },
        time: {
            start: -1,
            end: -1,
            duration: -1
        }
    };
};

export {
    getDefaultUserOngoingData
};