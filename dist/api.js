"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stop = exports.start = exports.server = void 0;
const tslib_1 = require("tslib");
const helmet_1 = tslib_1.__importDefault(require("@fastify/helmet"));
const fastify_1 = tslib_1.__importDefault(require("fastify"));
const cache_1 = require("./cache");
const influx_1 = require("./db/influx");
const postgres_1 = require("./db/postgres");
const redis_1 = require("./db/redis");
const endpoint_1 = require("./endpoint");
const logger_1 = require("./logger");
const sentry_1 = require("./sentry");
const events_1 = require("./util/events");
const locale_1 = require("./util/locale");
async function start() {
    exports.server = (0, fastify_1.default)({
        logger: process.env.NODE_ENV !== 'production',
        ignoreTrailingSlash: true,
        bodyLimit: 262144
    });
    cache_1.cron.start();
    influx_1.cron.start();
    await Promise.all([(0, locale_1.load)(), (0, events_1.load)(), (0, postgres_1.connect)(), (0, redis_1.connect)(), exports.server.register(helmet_1.default)]);
    exports.server.addHook('onRequest', async (req, reply) => {
        req.responseTimeCalc = process.hrtime();
        reply.headers({
            'X-Response-Time': process.hrtime(),
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
            Connection: 'close'
        });
        return;
    });
    exports.server.addHook('onSend', async (req, reply) => {
        const diff = process.hrtime(req.responseTimeCalc);
        reply.header('X-Response-Time', diff[0] * 1e3 + diff[1] / 1e6);
        return;
    });
    exports.server.route(endpoint_1.headRoute);
    exports.server.route(endpoint_1.route);
    exports.server.route({
        method: 'GET',
        url: '/health',
        handler: async (req, reply) => {
            return reply.status(200).send({ ok: true });
        }
    });
    const port = parseInt(process.env.API_PORT, 10) || 3000;
    const host = process.env.API_HOST || '127.0.0.1';
    await exports.server.listen();
    logger_1.logger.info(`Running webhook on port ${port}, env: ${process.env.NODE_ENV || 'development'}`);
    if (process.send)
        process.send('ready');
    process.on('SIGINT', stop);
    process.on('unhandledRejection', (err) => {
        logger_1.logger.error('Unhandled rejection', err);
    });
}
exports.start = start;
async function stop() {
    logger_1.logger.info('Shutting down...');
    cache_1.cron.stop();
    influx_1.cron.stop();
    await exports.server.close();
    await (0, sentry_1.close)();
    await (0, postgres_1.disconnect)();
    (0, redis_1.disconnect)();
    logger_1.logger.info('All things disconnected.');
    process.exit(0);
}
exports.stop = stop;
//# sourceMappingURL=api.js.map