const spawn = require("child_process").spawn;

async function download() {
    const pythonProcess = spawn('python', ["./port.py", 'test', 'main/haha.png', './stj/hoho.png']);
    let b = await new Promise((resolve) => {
        pythonProcess.stdout.on('data', (data) => {
            console.log(data.toString());
            resolve('ok!')
        });
    });
    console.log(b);
}

download();