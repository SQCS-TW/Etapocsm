import { Mongo, MongoDataInterface } from '../../../core/db/mongodb';
import { Collection, ObjectId } from 'mongodb';


class bountyAccountManager {
    private cursor_promise: Promise<Collection>;

    constructor() {
        // use promise here due to non-async constructor
        this.cursor_promise = (new Mongo('Bounty')).getCur('Accounts');
    }

    public async checkAccountExistence(user_id: string) {
        const member_data = await (await this.cursor_promise).findOne({ user_id: user_id });
        
        if (member_data) return true;
        return false;
    }

    public async createAccount(user_id: string) {
        const default_member_data: MongoDataInterface = {
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

        const result = await (await this.cursor_promise).insertOne(default_member_data);

        return result.acknowledged;
    }

    public async setStatus(user_id: string, status: boolean) {
        const cursor = await this.cursor_promise;
        const member_data = await cursor.findOne({ user_id: user_id });

        if (!member_data) return {
            result: false,
            message: ':x: 無此用戶'
        };

        const execute = {
            $set: {
                active: status
            }
        };

        const update_result = await cursor.updateOne({ user_id: user_id }, execute);
        if (!update_result.acknowledged) return {
            result: false,
            message: ':x: 寫入錯誤'
        };

        return {
            result: true,
            message: ':white_check_mark: 寫入成功'
        };
    }
}

export {
    bountyAccountManager
}