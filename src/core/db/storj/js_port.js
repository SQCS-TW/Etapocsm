const execSync = require("child_process").execSync;


async function storj_download(bucket_name, local_file_name, db_file_name) {
    let download_result = execSync(`python ./src/core/db/storj/py_port.py download_file ${bucket_name} ${local_file_name} ${db_file_name}`);
    download_result = download_result.toString("utf-8");

    download_result = (download_result.trim() === 'true');
    return download_result;
};

async function get_folder_size(bucket_name, prefix) {
    let size = execSync(`python ./src/core/db/storj/py_port.py get_folder_size ${bucket_name} ${prefix}`);
    size = size.toString('utf-8');
    return Number(size);
};


module.exports = {
    storj_download,
    get_folder_size
};