import { MongoData } from '../../db/reglist';
import { ObjectId } from 'mongodb';
import * as core from '../../core/reglist';

export const getDefaultBountyQnsInfo = async function (payload: core.DefaultDataPayload): Promise<MongoData> {
    return {
        _id: new ObjectId(),
        difficulty: payload.difficulty,
        qns_number: payload.qns_number,
        max_choices: payload.max_choices,
        correct_ans: payload.correct_ans
    }
};
