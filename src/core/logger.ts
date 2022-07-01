import { createLogger, transports, format } from 'winston';

export const logger = createLogger({
    level: 'info',
    defaultMeta: { service: 'user-service' },
    transports: [
        new transports.Console({
            level: 'debug'
        }),
        new transports.File({ filename: './logs/error.log', level: 'error' }),
        new transports.File({ filename: './logs/info.log', level: 'info' })
    ],
    format: format.combine(
        format.timestamp({
            format: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })
        }),
        format.printf(info => `[${info.level.toUpperCase()}] (${[info.timestamp]}): ${info.message}\n`)
    )
});
