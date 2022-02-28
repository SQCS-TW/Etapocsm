const cron = require('node-cron');
const fs = require('fs');
const { Mongo } = require('../../core/db/mongodb.js');

/*
    * --- day of week
    * --- month
    * --- day of month
    * --- hour
    * --- minute
    * --- second (optional)
*/

class BountyTaskManager extends CogExtension {

}

async function checkOngoingPipeline() {
    const json_path = './assets/buffer/bounty/player_data.json'

    const rawdata = fs.readFileSync(json_path);
    const player_data = JSON.parse(rawdata);

    if (Object.keys(player_data).length === 0) {
        console.log('act!');
        const pl_cursor = await (new Mongo('Bounty')).getCur('OngoingPipeline');

        // find the minimum due time
        const nearest_due_data = (await pl_cursor.find({}).sort({ due_time: 1 }).limit(1).toArray())[0];

        if (!nearest_due_data) return;

        const player_data = {
            id: nearest_due_data._id,
            recent_due_time: nearest_due_data.due_time
        };

        console.log(player_data);
        const write_data = JSON.stringify(player_data);
        fs.writeFile(json_path, write_data, () => { });

        return;
    };

    if (player_data.recent_due_time <= Date.now()) {
        console.log('expired!: ', player_data.id);
    };
};

async function checkMenuApplications() {
    const cursor = await (new Mongo('Interaction')).getCur('Pipeline');
    const data = await cursor.find({}).toArray();

    for (let i = 0; i < data.length; i++) {
        if (data[i].due_time < Date.now()) {
            await cursor.deleteOne({ _id: data[i]._id });
            console.log('deleted:');
            console.log(data[i]);
        };
    };
};

let BountyTaskManager_act;

function promoter(bot) {
    BountyTaskManager_act = new BountyTaskManager(bot);

    // do this every 5 seconds
    cron.schedule('*/5 * * * * *', checkMenuApplications);
    cron.schedule('*/5 * * * * *', checkOngoingPipeline);
};



module.exports = {
    promoter
};
