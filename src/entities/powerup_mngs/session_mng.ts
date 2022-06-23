import { Redis } from '../../db/reglist';
import { core } from '../shortcut';
import { EventEmitter } from 'events';


export type SessionConfig = {
    session_name: string,
    interval_data: IntervalData;
};

type IntervalData = {
    idle: number,
    normal: number,
    fast: number
};

export type SessionData = {
    id: string,
    expired_date: number
};


export class SessionManager extends core.BaseManager {
    private session_name: string;
    private interval_data: IntervalData;

    protected cache = new Redis();
    protected event = new EventEmitter();

    private maintaining_data = false;

    constructor(f_platform: core.BasePlatform, session_config: SessionConfig) {
        super(f_platform);
        
        this.session_name = session_config.session_name;
        this.interval_data = session_config.interval_data;

        this.f_platform.f_bot.on('ready', async () => {
            await this.cache.connect();

            await this.checkSession();
        });
    }

    protected async writeData(data: SessionData[]) {
        this.maintaining_data = true;
        await this.cache.client.SET(this.session_name, JSON.stringify(data));
        this.maintaining_data = false;
    }

    protected async getData(): Promise<SessionData[]> {
        const data = await this.cache.client.GET(this.session_name);
        if (data === null) return null;
        return JSON.parse(data);
    }

    private async checkSession() {
        const self_routine = (t: number) => setTimeout(async () => { await this.checkSession(); }, t * 1000);

        if (this.maintaining_data) return self_routine(this.interval_data.fast);

        const data = await this.getData();
        if (data === null || data.length === 0) return self_routine(this.interval_data.idle);
        
        if (data[0].expired_date <= Date.now()) {
            this.event.emit('sessionExpired', data[0]);
            data.shift();
            await this.writeData(data);
            console.log('cache del', data[0]);
        }

        return self_routine(this.interval_data.normal);
    }
}
