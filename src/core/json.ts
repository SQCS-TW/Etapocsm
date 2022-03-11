import fs from 'fs'

class jsonOperator {
    public async readFile(file_path: string) {
        const rawdata: string = String(fs.readFileSync(file_path));
        return JSON.parse(rawdata);
    };

    public async writeFile(file_path: string, write_data: any) {
        write_data = JSON.stringify(write_data, null, 4);
        fs.writeFile(file_path, write_data, () => { });
    };
};

export {
    jsonOperator
}