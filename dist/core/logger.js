"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normal_logger = exports.critical_logger = void 0;
const utils_1 = require("./utils");
const winston_1 = require("winston");
const { combine, label, printf } = winston_1.format;
const onlyLogCertainLevels = (0, winston_1.format)((info, target_levels) => {
    if (target_levels.includes(info.level))
        return info;
    return false;
});
const myFormat = printf(({ level, label, message, metadata }) => {
    let output = `${(0, utils_1.localizeDatetime)()} [${label}] ${level}: ${message}\n`;
    if (metadata)
        output += `meta: ${JSON.stringify(metadata, null, 4)}\n`;
    return output;
});
exports.critical_logger = (0, winston_1.createLogger)({
    level: 'warn',
    format: combine(onlyLogCertainLevels(['warn', 'error']), label({ label: 'CRITICAL' }), myFormat),
    transports: [
        new winston_1.transports.Console(),
        new winston_1.transports.File({ filename: './logs/critical.log' })
    ]
});
exports.normal_logger = (0, winston_1.createLogger)({
    level: 'debug',
    format: combine(onlyLogCertainLevels(['debug', 'info']), label({ label: 'NORMAL' }), myFormat),
    transports: [
        new winston_1.transports.Console(),
        new winston_1.transports.File({ filename: './logs/normal.log' })
    ]
});
