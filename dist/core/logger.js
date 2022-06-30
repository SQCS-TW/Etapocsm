"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = require("winston");
exports.logger = (0, winston_1.createLogger)({
    level: 'info',
    defaultMeta: { service: 'user-service' },
    transports: [
        new winston_1.transports.Console(),
        new winston_1.transports.File({ filename: './logs/error.log', level: 'error' }),
        new winston_1.transports.File({ filename: './logs/info.log', level: 'info' })
    ],
    format: winston_1.format.combine(winston_1.format.timestamp({
        format: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })
    }), winston_1.format.printf(info => `[${info.level.toUpperCase()}] (${[info.timestamp]}): ${info.message}`))
});
