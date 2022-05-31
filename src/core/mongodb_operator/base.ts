import { Mongo } from '../../db/reglist';
import { Collection } from 'mongodb';


type OperatorResponse = {
    status: boolean | string,
    message?: string
}

type DefaultDataPayload = {
    user_id: string,
    [key: string]: any
}

type OperatorConstructPayload = {
    db: string,
    coll: string,
    default_data_function?: any
}

class BaseOperator {
    // use promise here due to non-async constructor
    protected cursor_promise: Promise<Collection>;

    protected createDefaultDataFunction: any;

    constructor(payload: OperatorConstructPayload) {
        // use promise here due to non-async constructor
        this.cursor_promise = (new Mongo(payload.db)).getCur(payload.coll);

        if (payload.default_data_function) {
            this.createDefaultDataFunction = payload.default_data_function;
        }
    }

    public async checkDataExistence(payload: DefaultDataPayload, auto_create_account = false): Promise<OperatorResponse> {
        const user_data = await (await this.cursor_promise).findOne(payload);

        if (user_data) return {
            status: "nM002"
        };

        if (auto_create_account) {
            const result = await this.createUserData(payload);
            return result;
        }

        return {
            status: "M002",
            message: ':x:**【查詢錯誤】**找不到用戶資料'
        };
    }

    public async createUserData(payload: DefaultDataPayload) {
        try {
            const default_data = await this.createDefaultDataFunction(payload);

            const result = await (await this.cursor_promise).insertOne(default_data);
            if (result.acknowledged) return {
                status: "nM003"
            };
            return {
                status: "M003",
                message: ':x:**【操作錯誤】**資料新增錯誤'
            };
        } catch (err) {
            console.log(err);
        }
    }
}


export {
    BaseOperator,
    OperatorResponse,
    DefaultDataPayload,
    OperatorConstructPayload
};
