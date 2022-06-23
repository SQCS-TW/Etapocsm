import { createClient } from 'redis';


export class Redis {
    public connected = false;

    public client = createClient({
        password: process.env.REDIS_PW
    });

    public async connect() {
        await this.client.connect();
        this.connected = true;
    }
}
