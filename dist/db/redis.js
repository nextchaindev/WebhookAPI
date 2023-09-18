"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCache = exports.setCache = exports.disconnect = exports.connect = exports.batchHandoffs = exports.available = exports.subClient = exports.client = void 0;
const tslib_1 = require("tslib");
const ioredis_1 = tslib_1.__importDefault(require("ioredis"));
const logger_1 = require("../logger");
exports.client = new ioredis_1.default({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10),
    keyPrefix: process.env.REDIS_PREFIX,
    password: process.env.REDIS_PASSWORD,
    lazyConnect: true
});
exports.subClient = new ioredis_1.default({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10),
    keyPrefix: process.env.REDIS_PREFIX,
    password: process.env.REDIS_PASSWORD,
    lazyConnect: true
});
exports.available = process.env.REDIS_HOST && process.env.REDIS_PORT;
exports.batchHandoffs = new Map();
exports.subClient.on('message', (channel, message) => {
    const prefix = 'batch_handoff:';
    if (!channel.startsWith(prefix))
        return;
    const id = channel.slice(prefix.length);
    if (exports.batchHandoffs.has(id)) {
        logger_1.logger.log(`Passed in a batch for ${id}`);
        exports.batchHandoffs.get(id).add(JSON.parse(message));
    }
});
const connect = async () => {
    if (exports.available) {
        await exports.client.connect();
        await exports.subClient.connect();
    }
};
exports.connect = connect;
const disconnect = () => {
    if (exports.available) {
        exports.client.disconnect();
        exports.subClient.disconnect();
    }
};
exports.disconnect = disconnect;
const setCache = async (key, value) => {
    if (exports.available)
        return exports.client.set(key, value, 'EX', 60 * 60);
};
exports.setCache = setCache;
const getCache = async (key) => {
    if (exports.available)
        return await exports.client.get(key);
};
exports.getCache = getCache;
//# sourceMappingURL=redis.js.map