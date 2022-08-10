import { localizeDatetime } from './utils';
import { createLogger, format, transports } from 'winston';
const { combine, label, printf } = format;


const onlyLogCertainLevels = format((info, target_levels) => {
    if (target_levels.includes(info.level)) return info;
    else return false;
});

const myFormat = printf(({ level, label, message, metadata }) => {
    let output = `${localizeDatetime()} [${label}] ${level}: ${message}\n`;
    if (metadata) output += `meta: ${JSON.stringify(metadata, null, 4)}\n`;
    return output;
});

export const critical_logger = createLogger({
    level: 'warn',
    format: combine(
        onlyLogCertainLevels(['warn', 'error']),
        label({ label: 'CRITICAL' }),
        myFormat
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: './logs/critical.log' })
    ]
});

export const normal_logger = createLogger({
    level: 'debug',
    format: combine(
        onlyLogCertainLevels(['debug', 'info']),
        label({ label: 'NORMAL' }),
        myFormat
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: './logs/normal.log' })
    ]
});
