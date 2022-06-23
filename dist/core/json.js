"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsonOperator = void 0;
const fs_1 = __importDefault(require("fs"));
class jsonOperator {
    async readFile(file_path) {
        const rawdata = String(fs_1.default.readFileSync(file_path));
        return JSON.parse(rawdata);
    }
    async writeFile(file_path, write_data) {
        write_data = JSON.stringify(write_data, null, 4);
        fs_1.default.writeFileSync(file_path, write_data);
    }
}
exports.jsonOperator = jsonOperator;
