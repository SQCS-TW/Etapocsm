"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionManager = void 0;
const reglist_1 = require("../../db/reglist");
const shortcut_1 = require("../shortcut");
const events_1 = require("events");
class SessionManager extends shortcut_1.core.BaseManager {
    constructor(f_platform, session_config) {
        super(f_platform);
        this.cache = new reglist_1.Redis();
        this.event = new events_1.EventEmitter();
        this.maintaining_data = false;
        this.session_name = session_config.session_name;
        this.interval_data = session_config.interval_data;
        this.f_platform.f_bot.on('ready', async () => {
            await this.cache.connect();
            await this.checkSession();
        });
    }
    async writeData(data) {
        this.maintaining_data = true;
        await this.cache.client.SET(this.session_name, JSON.stringify(data));
        this.maintaining_data = false;
    }
    async getData() {
        const data = await this.cache.client.GET(this.session_name);
        if (data === null)
            return null;
        return JSON.parse(data);
    }
    async checkSession() {
        const self_routine = (t) => setTimeout(async () => { await this.checkSession(); }, t * 1000);
        if (this.maintaining_data)
            return self_routine(this.interval_data.fast);
        const data = await this.getData();
        if (data === null || data.length === 0)
            return self_routine(this.interval_data.idle);
        if (data[0].expired_date <= Date.now()) {
            this.event.emit('sessionExpired', data[0]);
            data.shift();
            await this.writeData(data);
            console.log('cache del', data[0]);
        }
        return self_routine(this.interval_data.normal);
    }
}
exports.SessionManager = SessionManager;
