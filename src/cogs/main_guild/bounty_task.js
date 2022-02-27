const cron = require('node-cron');
const fs = require('fs');
const { Mongo } = require('../../core/db/mongodb.js');

// warning: not tested yet

/*
    * --- day of week
    * --- month
    * --- day of month
    * --- hour
    * --- minute
    * --- second (optional)
*/

// function checkOngoingPipelineDueTime() {
//     const rawdata = fs.readFileSync('./assets/buffer/bounty/player_data.json');
//     const player_data = JSON.parse(rawdata);

//     if (!player_data.recent_due_time) return;
//     console.log(!player_data.recent_due_time);
// };

async function checkInteractionApplications() {
    const cursor = await (new Mongo('Interaction')).getCur('Pipeline');
    const data = await (await cursor).find({}).toArray();

    for (let i = 0; i < data.length; i++) {
        if (data[i].due_time < Date.now()) {
            await (await cursor).deleteOne({ _id: data[i]._id });
            console.log('deleted:');
            console.log(data[i]);
        };
    };
};

function promoter(bot) {
    cron.schedule('*/5 * * * * *', checkInteractionApplications);
};

module.exports = {
    promoter
};
