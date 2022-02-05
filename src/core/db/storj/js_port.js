const execSync = require("child_process").execSync;


async function storj_download(bucket_name, local_file_name, db_file_name) {
    let download_result = execSync(`python ./src/core/db/storj/py_port.py download_file ${bucket_name} ${local_file_name} ${db_file_name}`);
    download_result = download_result.toString("utf-8");

    download_result = (download_result.trim() === 'true');
    return download_result;
};

async function get_folder_size(bucket_name, prefix, suffixes) {
    let size;
    if (suffixes) {
        size = execSync(`python ./src/core/db/storj/py_port.py get_folder_size ${bucket_name} ${prefix} ${suffixes}`);
    } else {
        size = execSync(`python ./src/core/db/storj/py_port.py get_folder_size ${bucket_name} ${prefix}`);
    };

    size = size.toString('utf-8');

    if (size === 'false') return false;
    return Number(size);
};

async function get_folder_files(bucket_name, prefix, suffixes) {
    let filenames;
    if (suffixes) {
        filenames = execSync(`python ./src/core/db/storj/py_port.py get_folder_files ${bucket_name} ${prefix} ${suffixes}`);
    } else {
        filenames = execSync(`python ./src/core/db/storj/py_port.py get_folder_files ${bucket_name} ${prefix}`);
    };

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
    storj_download,
    get_folder_size,
    get_folder_files
};