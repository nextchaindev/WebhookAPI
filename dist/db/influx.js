"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onWebhookSend = exports.webhooksSent = exports.activeWebhooks = exports.cron = exports.client = void 0;
const influxdb_client_1 = require("@influxdata/influxdb-client");
const node_1 = require("@sentry/node");
const cron_1 = require("cron");
const os_1 = require("os");
const logger_1 = require("../logger");
const postgres_1 = require("./postgres");
exports.client = process.env.INFLUX_URL ? new influxdb_client_1.InfluxDB({ url: process.env.INFLUX_URL, token: process.env.INFLUX_TOKEN }) : null;
exports.cron = new cron_1.CronJob('*/5 * * * *', collect, null, false, 'America/New_York');
exports.activeWebhooks = [];
exports.webhooksSent = 0;
function onWebhookSend(webhookID) {
    if (!exports.activeWebhooks.includes(webhookID))
        exports.activeWebhooks.push(webhookID);
    exports.webhooksSent++;
}
exports.onWebhookSend = onWebhookSend;
async function collect(timestamp = new Date()) {
    if (!process.env.INFLUX_URL || !process.env.INFLUX_TOKEN)
        return;
    const webhookCount = await postgres_1.Webhook.count();
    const activeWebhookCount = await postgres_1.Webhook.count({ where: { active: true } });
    const writeApi = exports.client.getWriteApi(process.env.INFLUX_ORG, process.env.INFLUX_BUCKET, 's');
    const point = new influxdb_client_1.Point('webhook_traffic')
        .tag('server', process.env.SERVER_NAME || (0, os_1.hostname)())
        .intField('sent', exports.webhooksSent)
        .intField('sentUnique', exports.activeWebhooks.length)
        .intField('count', webhookCount)
        .intField('countActive', activeWebhookCount)
        .timestamp(timestamp || exports.cron.lastDate());
    writeApi.writePoint(point);
    try {
        await writeApi.close();
        logger_1.logger.log('Sent stats to Influx.');
    }
    catch (e) {
        (0, node_1.withScope)((scope) => {
            scope.clear();
            scope.setExtra('date', timestamp || exports.cron.lastDate());
            (0, node_1.captureException)(e);
        });
        logger_1.logger.error('Error sending stats to Influx.', e);
    }
    exports.activeWebhooks = [];
    exports.webhooksSent = 0;
}
//# sourceMappingURL=influx.js.map