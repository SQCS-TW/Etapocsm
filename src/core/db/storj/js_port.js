const spawn = require("child_process").spawn;

async function storj_download(bucket_name, db_file_name, local_file_name) {
    const pythonProcess = spawn('python', ["./js_port.py", 'storj_download', bucket_name, db_file_name, local_file_name]);
    let download = await new Promise((resolve) => {
        pythonProcess.stdout.on('data', (data) => {
            console.log(data.toString());
            resolve('Ok');
        });
    });
    if (download) return true;
}

async function get_folder_size(bucket_name, prefix) {
    const pythonProcess = spawn('python', ["./js_port.py", 'get_folder_size', bucket_name, prefix]);
    let size = await new Promise((resolve) => {
        pythonProcess.stdout.on('data', (data) => {
            resolve(data.toString());
        });
    });
    return size;
}

module.exports = {
    storj_download,
    get_folder_size
}