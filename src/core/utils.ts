import { ObjectId } from 'mongodb';
import { Mongo } from './db/mongodb';


const timeAfterSecs = async (seconds) => { return Date.now() + seconds * 1000; };

const cloneObj = async (obj) => { return JSON.parse(JSON.stringify(obj)); };

const getRandomInt = async (max) => { return Math.floor(Math.random() * max); };

interface VerifyMenuApplicationInterface {
    _id: ObjectId,
    user_id: string
    type: string
};

async function verifyMenuApplication(verify: VerifyMenuApplicationInterface) {
    const cursor = await (new Mongo('Interaction')).getCur('Pipeline');
    const user_application: any = cursor.findOne(verify);

    if (user_application) {
        await cursor.deleteOne(verify);
        return true;
    } else {
        return false;
    };
}

export {
    cloneObj,
    timeAfterSecs,
    getRandomInt,
    verifyMenuApplication
}