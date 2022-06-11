"use strict";
/*

    此檔案為利用 ts 呼叫 py 的 ts -> ts 端口

*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storjGetFolderFiles = exports.storjGetFolderSize = exports.storjUpload = exports.storjDownload = void 0;
const child_process_1 = require("child_process");
function storjDownload(options) {
    return __awaiter(this, void 0, void 0, function* () {
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
    });
}
exports.storjDownload = storjDownload;
function storjUpload(options) {
    return __awaiter(this, void 0, void 0, function* () {
        /*
            bucket_name: the bucket in storj where the target file is.
            local_file_name: a full relative path of the file, including suffix.
            db_file_name: a full path of the target file in the bucket.
        */
        console.log(options);
        const command = `python ./src/db/storj/py_port.py upload_file ${options.bucket_name} ${options.local_file_name} ${options.db_file_name}`;
        let upload_result = (0, child_process_1.execSync)(command);
        upload_result = upload_result.toString("utf-8");
        console.log('upload result:', upload_result);
        upload_result = (upload_result.trim() === 'true');
        return upload_result;
    });
}
exports.storjUpload = storjUpload;
function storjGetFolderSize(options) {
    return __awaiter(this, void 0, void 0, function* () {
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
    });
}
exports.storjGetFolderSize = storjGetFolderSize;
function storjGetFolderFiles(options) {
    return __awaiter(this, void 0, void 0, function* () {
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
    });
}
exports.storjGetFolderFiles = storjGetFolderFiles;