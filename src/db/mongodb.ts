import { Db, MongoClient, Collection, ObjectId } from "mongodb";

const MONGODB_ACCOUNT = process.env.MONGODB_ACCOUNT;
const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD;

const uri = `mongodb+srv://${MONGODB_ACCOUNT}:${MONGODB_PASSWORD}@atlas.i38es.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri);

export type MongoData = {
    _id: ObjectId
    [key: string]: any
}

export async function connectMongoDB() {
    await client.connect();
}

export class Mongo {
    private db: Db;

    constructor(database: string) {
        this.db = client.db(database);
    }

    public async getCur(collection: string): Promise<Collection> {
        // return the cursor of collection: "collection"
        return this.db.collection(collection);
    }
}
