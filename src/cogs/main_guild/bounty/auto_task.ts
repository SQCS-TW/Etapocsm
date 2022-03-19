import cron from 'node-cron';
import { Mongo, MongoDataInterface } from '../../../core/db/mongodb';
import { Collection } from 'mongodb';
import { jsonOperator } from '../../../core/json';
import { Etapocsm } from '../../../../main';

/*
    * --- day of week
    * --- month
    * --- day of month
    * --- hour
    * --- minute
    * --- second (optional)
*/

// class BountyTaskManager extends CogExtension {

// }

const jsonOp = new jsonOperator();

interface pipelineCacheInterface {
    user_id: string,
    recent_due_time: number
}

let pl_cursor: Collection;
let inter_pl_cursor: Collection;

async function fetchPipelineCursors() {
    pl_cursor = await (new Mongo('Bounty')).getCur('OngoingPipeline');
    inter_pl_cursor = await (new Mongo('Interaction')).getCur('Pipeline');
}

fetchPipelineCursors();

async function findNearestData() {
    const nearest_due_data = (await pl_cursor.find({}).sort({ due_time: 1 }).limit(1).toArray())[0];
    if (!nearest_due_data) return;

    return {
        user_id: nearest_due_data.user_id,
        recent_due_time: nearest_due_data.due_time
    };
}

async function checkOngoingPipeline() {
    const json_path = './cache/bounty/player_data.json'
    const player_data: pipelineCacheInterface = await jsonOp.readFile(json_path);

    if (Object.keys(player_data).length === 0) {
        const new_player_data: pipelineCacheInterface = await findNearestData();
        if (!new_player_data) return;

        await jsonOp.writeFile(json_path, new_player_data);
        return;
    }

    if (player_data.recent_due_time <= Date.now()) {
        // clear the data
        await jsonOp.writeFile(json_path, {});
    }
}

async function checkExpired(item: MongoDataInterface) {
    return (item.due_time <= Date.now());
}

async function deleteItem(item: MongoDataInterface) {
    await inter_pl_cursor.deleteOne({ user_id: item.user_id });
    console.log('deleted: ', item);
}

async function checkMenuApplications() {
    const data = await inter_pl_cursor.find({}).toArray();
    data.filter(checkExpired).forEach(deleteItem);
}

// let BountyTaskManager_act;

async function promoter(bot: Etapocsm) {
    const cog_name = 'bounty_auto_task';
    // BountyTaskManager_act = new BountyTaskManager(bot);

    // do this every 5 seconds
    cron.schedule('*/5 * * * * *', checkMenuApplications);
    cron.schedule('*/5 * * * * *', checkOngoingPipeline);
    return cog_name;
}


export {
    promoter
};
