/*

    此檔案為利用 ts 呼叫 py 的 ts -> ts 端口

*/

const execSync = require("child_process").execSync;


interface StorjDownloadOptions {
    bucket_name: string,
    local_file_name: string,
    db_file_name: string
}

async function storjDownload(options: StorjDownloadOptions) {
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
}

interface GetFolderSizeInterface {
    bucket_name: string,
    prefix: string,
    suffixes?: string
}

async function getFolderSize(options: GetFolderSizeInterface) {
    /*
        options = {
            bucket_name: the bucket in storj where the target folder is,
            prefix: the target folder's path,
            suffixes?: file types to include, seperated by '-'
        }
    */

    let command = `python ./src/core/db/storj/py_port.py getFolderSize ${options.bucket_name} ${options.prefix}`;
    if (options.suffixes) command += ` ${options.suffixes}`;

    let size = execSync(command);
    size = size.toString('utf-8');

    if (size === 'false') return false;
    return Number(size);
}

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

    const filenames_array = filenames.split(', ');
    for (let i = 0; i < filenames_array.length; i++) {
        filenames_array[i] = filenames_array[i]
            .replace("'", '')
            .replace("'", '')
            .replace("\r", '')
            .replace("\n", '');
    }
    return filenames_array;
}


export {
    storjDownload,
    getFolderSize,
    getFolderFiles
};