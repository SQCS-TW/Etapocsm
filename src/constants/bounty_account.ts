import { MongoDataInterface } from '../db/reglist';
import { ObjectId } from 'mongodb';

const getDefaultBountyAccount = async function (user_id: string): Promise<MongoDataInterface> {
    return {
        _id: new ObjectId(),
        user_id: user_id,
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
