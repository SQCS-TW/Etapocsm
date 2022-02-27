const cron = require('node-cron');
const fs = require('fs');

// warning: not tested yet

/*
    * --- day of week
    * --- month
    * --- day of month
    * --- hour
    * --- minute
    * --- second (optional)
*/

function checkOngoingPipelineDueTime() {
    const rawdata = fs.readFileSync('./assets/buffer/bounty/player_data.json');
    const player_data = JSON.parse(rawdata);

    if (!player_data.recent_due_time) return;
    console.log(!player_data.recent_due_time);
};

function promoter(bot) {
    cron.schedule('2 * * * * *', checkOngoingPipelineDueTime);
};

module.exports = {
    promoter
};
