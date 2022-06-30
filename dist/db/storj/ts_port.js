"use strict";
/*

    此檔案為利用 ts 呼叫 py 的 ts -> ts 端口

*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.storjDeleteFile = exports.storjGetFolderFiles = exports.storjGetFolderSize = exports.storjUpload = exports.storjDownload = void 0;
const child_process_1 = require("child_process");
const reglist_1 = require("../../core/reglist");
async function storjDownload(options) {
    /*
        bucket_name: the bucket in storj where the target file is.
        local_file_name: a full relative path of the file, including suffix.
        db_file_name: a full path of the target file in the bucket.
    */
    const command = `python ./src/db/storj/py_port.py download_file ${options.bucket_name} ${options.local_file_name} ${options.db_file_name}`;
    let download_result = (0, child_process_1.execSync)(command);
    download_result = download_result.toString("utf-8");
    download_result = (download_result.trim() === 'true');
    return download_result;
}
exports.storjDownload = storjDownload;
async function storjUpload(options) {
    /*
        bucket_name: the bucket in storj where the target file is.
        local_file_name: a full relative path of the file, including suffix.
        db_file_name: a full path of the target file in the bucket.
    */
    const command = `python ./src/db/storj/py_port.py upload_file ${options.bucket_name} ${options.local_file_name} ${options.db_file_name}`;
    let upload_result = (0, child_process_1.execSync)(command);
    upload_result = upload_result.toString("utf-8");
    reglist_1.logger.debug(`upload result: ${upload_result}`);
    upload_result = (upload_result.trim() === 'true');
    return upload_result;
}
exports.storjUpload = storjUpload;
async function storjGetFolderSize(options) {
    /*
        bucket_name: the bucket in storj where the target folder is,
        prefix: the target folder's path,
        suffixes?: file types to include, separated by '-'
    */
    let command = `python ./src/db/storj/py_port.py getFolderSize ${options.bucket_name} ${options.prefix}`;
    if (options.suffixes)
        command += ` ${options.suffixes}`;
    let size = (0, child_process_1.execSync)(command);
    size = size.toString('utf-8');
    if (size === 'false')
        return false;
    return Number(size);
}
exports.storjGetFolderSize = storjGetFolderSize;
async function storjGetFolderFiles(options) {
    /*
        bucket_name: the bucket in storj where the target folder is,
        prefix: the target folder's path,
        suffixes: file types to include, separated by '-'
    */
    let command = `python ./src/db/storj/py_port.py getFolderFiles ${options.bucket_name} ${options.prefix}`;
    if (options.suffixes)
        command += ` ${options.suffixes}`;
    let filenames = (0, child_process_1.execSync)(command);
    filenames = filenames.toString('utf-8');
    const filenames_array = filenames.split(', ');
    for (let i = 0; i < filenames_array.length; i++) {
        filenames_array[i] = filenames_array[i]
            .replace("\r", '')
            .replace("\n", '');
    }
    return filenames_array;
}
exports.storjGetFolderFiles = storjGetFolderFiles;
async function storjDeleteFile(options) {
    /*
        bucket_name: the bucket in storj where the target folder is,
        delete_path: the storj path where the target file is
    */
    const command = `python ./src/db/storj/py_port.py delete_file ${options.bucket_name} ${options.delete_path}`;
    let delete_result = (0, child_process_1.execSync)(command);
    delete_result = delete_result.toString("utf-8");
    reglist_1.logger.debug(`delete result: ${delete_result}`);
    delete_result = (delete_result.trim() === 'true');
    return delete_result;
}
exports.storjDeleteFile = storjDeleteFile;
