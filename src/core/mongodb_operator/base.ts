import { Mongo } from '../../db/reglist';
import { Collection } from 'mongodb';


type OperatorResponse = {
    status: boolean,
    message?: string
}


class BaseOperator {
    // use promise here due to non-async constructor
    protected cursor_promise: Promise<Collection>;

    protected createDefaultDataFunction: any;

    constructor(db: string, coll: string) {
        // use promise here due to non-async constructor
        this.cursor_promise = (new Mongo(db)).getCur(coll);
    }

    public async checkUserDataExistence(user_id: string, auto_create_account = false): Promise<OperatorResponse> {
        const user_data = await (await this.cursor_promise).findOne({ user_id: user_id });

        if (user_data) return {
            status: true
        };

        if (auto_create_account) {
            const result = await this.createUserData(user_id);
            if (result.status) return {
                status: true
            };
        }

        return {
            status: false,
            message: ':x:**【查詢錯誤】**找不到用戶資料'
        };
    }

    public async createUserData(user_id: string) {
        try {
            const default_data = await this.createDefaultDataFunction(user_id);

            const result = await (await this.cursor_promise).insertOne(default_data);
            if (result.acknowledged) return {
                status: true
            };
            return {
                status: false,
                message: ':x:**【操作錯誤】**資料新增錯誤'
            };
        } catch (err) {
            console.log(err);
        }
    }
}


export {
    BaseOperator,
    OperatorResponse
};
