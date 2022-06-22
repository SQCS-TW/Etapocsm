"use strict";
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
        this.connected = false;
        this.session_name = session_config.session_name;
        this.interval_data = session_config.interval_data;
        this.f_platform.f_bot.on('ready', () => __awaiter(this, void 0, void 0, function* () {
            yield this.cache.connect();
            this.connected = true;
            yield this.checkSession();
        }));
    }
    writeData(data) {
        return __awaiter(this, void 0, void 0, function* () {
            this.maintaining_data = true;
            yield this.cache.client.SET(this.session_name, JSON.stringify(data));
            this.maintaining_data = false;
        });
    }
    getData() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.cache.client.GET(this.session_name);
            if (data === null)
                return null;
            return JSON.parse(data);
        });
    }
    checkSession() {
        return __awaiter(this, void 0, void 0, function* () {
            const self_routine = (t) => setTimeout(() => __awaiter(this, void 0, void 0, function* () { yield this.checkSession(); }), t * 1000);
            if (this.maintaining_data)
                return self_routine(this.interval_data.fast);
            const data = yield this.getData();
            if (data === null || data.length === 0)
                return self_routine(this.interval_data.idle);
            if (data[0].expired_date <= Date.now()) {
                this.event.emit('sessionExpired', data[0]);
                data.shift();
                yield this.writeData(data);
                console.log('cache del', data[0]);
            }
            return self_routine(this.interval_data.normal);
        });
    }
}
exports.SessionManager = SessionManager;
