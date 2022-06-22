import { createClient } from 'redis';

export class Redis {
    public client = createClient({
        password: process.env.REDIS_PW
    });

    public async connect() {
        await this.client.connect();
    }

    constructor() {
        console.log('red', process.env.REDIS_PW);
    }
}
