"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mongo = void 0;
const mongodb_1 = require("mongodb");
const MONGODB_ACCOUNT = process.env.MONGODB_ACCOUNT;
const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD;
const uri = `mongodb+srv://${MONGODB_ACCOUNT}:${MONGODB_PASSWORD}@atlas.i38es.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new mongodb_1.MongoClient(uri);
client.connect();
class Mongo {
    constructor(database) {
        this.db = client.db(database);
    }
    getCur(collection) {
        return __awaiter(this, void 0, void 0, function* () {
            // return the cursor of collection: "collection"
            return this.db.collection(collection);
        });
    }
}
exports.Mongo = Mongo;
