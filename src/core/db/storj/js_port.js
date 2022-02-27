/*

    此檔案為利用 js 呼叫 py 的 js -> js 端口

*/

const execSync = require("child_process").execSync;


async function storjDownload(bucket_name, local_file_name, db_file_name) {
    let command = `python ./src/core/db/storj/py_port.py download_file ${bucket_name} ${local_file_name} ${db_file_name}`;

    let download_result = execSync(command);
    download_result = download_result.toString("utf-8");

    download_result = (download_result.trim() === 'true');
    return download_result;
};

async function getFolderSize(bucket_name, prefix, suffixes) {
    let command = `python ./src/core/db/storj/py_port.py getFolderSize ${bucket_name} ${prefix}`;
    if (suffixes) command += ` ${suffixes}`;

    let size = execSync(command);
    size = size.toString('utf-8');

    if (size === 'false') return false;
    return Number(size);
};

async function getFolderFiles(options) { // bucket_name, prefix, suffixes
    /*
        options = {
            bucket_name: 
        }
    */
    let command = `python ./src/core/db/storj/py_port.py getFolderFiles ${bucket_name} ${prefix}`;
    if (suffixes) command += ` ${suffixes}`;

    let filenames = execSync(command);
    filenames = filenames.toString('utf-8');

    let filenames_array = filenames.split(', ');
    for (let i = 0; i < filenames_array.length; i++) {
        filenames_array[i] = filenames_array[i]
            .replace("'", '')
            .replace("'", '')
            .replace("\r", '')
            .replace("\n", '');
    };
    return filenames_array;
};


module.exports = {
    storjDownload,
    getFolderSize,
    getFolderFiles
};