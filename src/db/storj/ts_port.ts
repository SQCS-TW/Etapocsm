/*

    此檔案為利用 ts 呼叫 py 的 ts -> ts 端口

*/

import { execSync } from 'child_process';

type StorjDownloadOptions = {
    bucket_name: string,
    local_file_name: string,
    db_file_name: string
}

async function storjDownload(options: StorjDownloadOptions) {
    /*
        bucket_name: the bucket in storj where the target file is.
        local_file_name: a full relative path of the file, including suffix.
        db_file_name: a full path of the target file in the bucket.
    */

    const command = `python ./src/db/storj/py_port.py download_file ${options.bucket_name} ${options.local_file_name} ${options.db_file_name}`;

    let download_result: any = execSync(command);
    download_result = download_result.toString("utf-8");

    download_result = (download_result.trim() === 'true');
    return download_result;
}

type GetFolderSizeOptions = {
    bucket_name: string,
    prefix: string,
    suffixes?: string
}

async function getFolderSize(options: GetFolderSizeOptions) {
    /*
        bucket_name: the bucket in storj where the target folder is,
        prefix: the target folder's path,
        suffixes?: file types to include, seperated by '-'
    */

    let command = `python ./src/db/storj/py_port.py getFolderSize ${options.bucket_name} ${options.prefix}`;
    if (options.suffixes) command += ` ${options.suffixes}`;

    let size: any = execSync(command);
    size = size.toString('utf-8');

    if (size === 'false') return false;
    return Number(size);
}

type getFolderFilesOptions = {
    bucket_name: string,
    prefix: string,
    suffixes?: string
}

async function getFolderFiles(options: getFolderFilesOptions) {
    /*
        bucket_name: the bucket in storj where the target folder is,
        prefix: the target folder's path,
        suffixes: file types to include, seperated by '-'
    */

    let command = `python ./src/db/storj/py_port.py getFolderFiles ${options.bucket_name} ${options.prefix}`;
    if (options.suffixes) command += ` ${options.suffixes}`;

    let filenames: any = execSync(command);
    filenames = filenames.toString('utf-8');

    const filenames_array = filenames.split(', ');
    for (let i = 0; i < filenames_array.length; i++) {
        filenames_array[i] = filenames_array[i]
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
