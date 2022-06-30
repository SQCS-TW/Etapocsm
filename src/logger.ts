import { createLogger, transports, format } from 'winston';

export const logger = createLogger({
    level: 'info',
    defaultMeta: { service: 'user-service' },
    transports: [
        new transports.Console(),
        new transports.File({ filename: 'error.log', level: 'error' }),
        new transports.File({ filename: 'normal.log' }),
    ],
    format: format.combine(
        format.timestamp({
            format: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })
        }),
        format.printf(info => `[${info.level.toUpperCase()}] (${[info.timestamp]}): ${info.message}`)
    )
});
