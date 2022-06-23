"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Redis = void 0;
const redis_1 = require("redis");
class Redis {
    constructor() {
        this.connected = false;
        this.client = (0, redis_1.createClient)({
            password: process.env.REDIS_PW
        });
    }
    async connect() {
        await this.client.connect();
        this.connected = true;
    }
}
exports.Redis = Redis;
