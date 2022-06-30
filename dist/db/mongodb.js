"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mongo = exports.connectMongoDB = void 0;
const mongodb_1 = require("mongodb");
const MONGODB_ACCOUNT = process.env.MONGODB_ACCOUNT;
const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD;
const uri = `mongodb+srv://${MONGODB_ACCOUNT}:${MONGODB_PASSWORD}@atlas.i38es.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new mongodb_1.MongoClient(uri);
async function connectMongoDB() {
    await client.connect();
}
exports.connectMongoDB = connectMongoDB;
class Mongo {
    constructor(database) {
        this.db = client.db(database);
    }
    async getCur(collection) {
        return this.db.collection(collection);
    }
}
exports.Mongo = Mongo;
