const { Mongo } = require('./db/mongodb.js');


const timeAfterSecs = async (seconds) => { return Date.now() + seconds * 1000; };

const cloneObj = async (obj) => { return JSON.parse(JSON.stringify(obj)); };

const getRandomInt = async (max) => { return Math.floor(Math.random() * max); };

async function verifyMenuApplication(verify) {
    const cursor = await (new Mongo('Interaction')).getCur('Pipeline');
    const user_application = await cursor.findOne(verify);

    if (user_application) {
        await cursor.deleteOne(verify);
        return true;
    } else {
        return false;
    };
}

module.exports = {
    cloneObj,
    timeAfterSecs,
    getRandomInt,
    verifyMenuApplication
}