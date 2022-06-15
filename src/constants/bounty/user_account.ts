import { MongoData } from '../../db/reglist';
import { ObjectId } from 'mongodb';
import * as core from '../../core/reglist';

export const getDefaultBountyAccount = async function (payload: core.DefaultDataPayload): Promise<MongoData> {
    return {
        _id: new ObjectId(),
        user_id: payload.user_id,
        create_date: Date.now(),
        auth: true,
        exp: 0,
        qns_record: {
            answered_qns_count: {
                easy: 0,
                medium: 0,
                hard: 0
            },
            correct_qns_count: {
                easy: 0,
                medium: 0,
                hard: 0
            },
            answered_qns_number: {
                easy: [],
                medium: [],
                hard: []
            }
        },
        personal_record: {
            thread_clear_count: 0,
            thread_all_clear_count: 0,
            extra_stamina_gained_count: 0
        }
    };
};
