const { MongoClient } = require('mongodb');

const MONGODB_ACCOUNT = process.env.MONGODB_ACCOUNT;
const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD;

const uri = `mongodb+srv://${MONGODB_ACCOUNT}:${MONGODB_PASSWORD}@atlas.i38es.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect();


class Mongo {
    constructor(database) {
        this.db = client.db(database);
    };

    async getCur(collection) {
        // return the cursor of collection: "collection"
        return this.db.collection(collection);
    };

    //transplanted from python
    // def get_curs(self, collections: List[str]):
    //     cursors: List[pymongo.cursor.CursorType] = [self.client[collection] for collection in collections]
    //     return tuple(cursors)

    // def get_all_curs(self):
    //     cursors: List[pymongo.cursor.CursorType] = \
    //         [self.client[collection] for collection in self.client.list_collection_names()]
    //     return tuple(cursors)
};


module.exports = {
    Mongo
};
