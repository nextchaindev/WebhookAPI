import { InfluxDB, Point } from '@influxdata/influxdb-client';
import { CronJob } from 'cron';
import { logger } from '../logger';
import { hostname } from 'os';
import { Webhook } from './postgres';

export const client = new InfluxDB({ url: process.env.INFLUX_URL, token: process.env.INFLUX_TOKEN });

export const cron = new CronJob('*/5 * * * *', collect, null, false, 'America/New_York');

export let activeWebhooks: string[] = [];
export let webhooksSent = 0;

export function onWebhookSend(webhookID: string) {
  if (!activeWebhooks.includes(webhookID)) activeWebhooks.push(webhookID);

  webhooksSent++;
}

async function collect(timestamp = new Date()) {
  if (!process.env.INFLUX_URL || !process.env.INFLUX_TOKEN) return;

  const webhookCount = await Webhook.count();
  const activeWebhookCount = await Webhook.count({ where: { active: true } });

  const writeApi = client.getWriteApi(process.env.INFLUX_ORG, process.env.INFLUX_BUCKET, 's');
  const point = new Point('webhook_traffic')
    .tag('server', process.env.SERVER_NAME || hostname())
    .intField('sent', webhooksSent)
    .intField('sentUnique', activeWebhooks.length)
    .intField('count', webhookCount)
    .intField('countActive', activeWebhookCount)
    .timestamp(timestamp);
  writeApi.writePoint(point);

  // Send to influx
  try {
    await writeApi.close();
    logger.log('Sent stats to Influx.');
  } catch (e) {
    logger.error('Error sending stats to Influx.', e);
  }

  // Flush data for next cron run
  activeWebhooks = [];
  webhooksSent = 0;
}
