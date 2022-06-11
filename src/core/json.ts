import fs from 'fs'


export class jsonOperator {
    public async readFile(file_path: string) {
        const rawdata = String(fs.readFileSync(file_path));
        return JSON.parse(rawdata);
    }

    public async writeFile(file_path: string, write_data: any) {
        write_data = JSON.stringify(write_data, null, 4);
        fs.writeFile(file_path, write_data, () => { return; });
    }
}
