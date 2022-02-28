/*

    此檔案為利用 js 呼叫 py 的 js -> js 端口

*/

const execSync = require("child_process").execSync;


async function storjDownload(options) {
    /*
        options = {
            bucket_name: the bucket in storj where the target file is.
            local_file_name: a full relative path of the file, including suffix.
            db_file_name: a full path of the target file in the bucket.
        }
    */

    const command = `python ./src/core/db/storj/py_port.py download_file ${options.bucket_name} ${options.local_file_name} ${options.db_file_name}`;

    let download_result = execSync(command);
    download_result = download_result.toString("utf-8");

    download_result = (download_result.trim() === 'true');
    return download_result;
};

async function getFolderSize(options) {
    /*
        options = {
            bucket_name: the bucket in storj where the target folder is,
            prefix: the target folder's path,
            suffixes: file types to include, seperated by '-'
        }
    */

    let command = `python ./src/core/db/storj/py_port.py getFolderSize ${options.bucket_name} ${options.prefix}`;
    if (options.suffixes) command += ` ${options.suffixes}`;

    let size = execSync(command);
    size = size.toString('utf-8');

    if (size === 'false') return false;
    return Number(size);
};

async function getFolderFiles(options) {
    /*
        options = {
            bucket_name: the bucket in storj where the target folder is,
            prefix: the target folder's path,
            suffixes: file types to include, seperated by '-'
        }
    */

    let command = `python ./src/core/db/storj/py_port.py getFolderFiles ${options.bucket_name} ${options.prefix}`;
    if (options.suffixes) command += ` ${options.suffixes}`;

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