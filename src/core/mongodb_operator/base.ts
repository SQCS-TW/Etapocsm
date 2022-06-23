import { Mongo } from '../../db/reglist';
import { Collection } from 'mongodb';
import { StatusCode } from '../../db/reglist';


export type OperatorResponse = {
    status: boolean | string,
    message?: string
}

export type DefaultDataPayload = {
    [key: string]: any
}

export type OperatorConstructPayload = {
    db: string,
    coll: string,
    default_data_function?: any
}

export class BaseMongoOperator {
    // use promise here due to non-async constructor
    public cursor_promise: Promise<Collection>;

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
            status: StatusCode.DATA_FOUND
        };

        if (auto_create_account) {
            const result = await this.createDefaultData(payload);
            return result;
        }

        return {
            status: StatusCode.DATA_NOT_FOUND,
            message: ':x:**【查詢錯誤】**找不到資料'
        };
    }

    public async createDefaultData(payload: DefaultDataPayload) {
        try {
            const default_data = await this.createDefaultDataFunction(payload);

            const result = await (await this.cursor_promise).insertOne(default_data);
            if (result.acknowledged) return {
                status: StatusCode.WRITE_DATA_SUCCESS
            };
            return {
                status: StatusCode.WRITE_DATA_ERROR,
                message: ':x:**【操作錯誤】**資料新增錯誤'
            };
        } catch (err) {
            console.log(err);
        }
    }
}
