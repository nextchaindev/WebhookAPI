import { addBreadcrumb, captureException, configureScope, startTransaction } from '@sentry/node';
import { createHmac } from 'crypto';
import { FastifyRequest, RouteOptions } from 'fastify';
import { RouteGenericInterface } from 'fastify/types/route';
import { IncomingMessage, Server } from 'http';

import { cardListMapCache, getListID } from './cache';
import { Webhook } from './db/postgres';
import { logger } from './logger';
import { events, findFilter } from './util/events';
import { TrelloDefaultAction, TrelloPayload } from './util/types';
import WebhookData from './util/webhookData';
import WebhookFilters from './util/webhookFilters';

export const whitelistedIPs = process.env.WHITELISTED_IPS ? process.env.WHITELISTED_IPS.split(',') : [];

function validateRequest(request: FastifyRequest<RouteGenericInterface, Server, IncomingMessage>) {
  const { id } = request.params as { id: string };
  const content = JSON.stringify(request.body) + process.env.API_URL + id;
  const hash = createHmac('sha1', process.env.TRELLO_SECRET).update(content).digest('base64');
  return hash === request.headers['x-trello-webhook'];
}

async function canBeSent(webhook: Webhook, body: TrelloPayload<any>) {
  // console.debug(JSON.stringify(body));
  const actionData = body.action.data;
  const boardID = body.model.id;
  const list = actionData.list || actionData.listAfter;
  let listID = list ? list.id : null;
  const card = actionData.card;

  // No filtered cards or lists have been assigned
  // if (!webhook.cards.length && !webhook.lists.length) return true;

  // No card was found on the event
  if (!card) return true;

  let allowed = true;

  // If there are list filters and no list was found on the event
  // if (!listID && webhook.lists.length) {
  //   if (cardListMapCache.has(card.id)) listID = cardListMapCache.get(card.id)[1];
  //   else listID = await getListID(card.id, boardID, webhook);
  // }

  // Whitelist policy
  // if (webhook.whitelist) {
  //   allowed = false;

  //   if (webhook.cards.length) allowed = allowed || webhook.cards.includes(card.id);
  //   if (webhook.lists.length && listID) allowed = allowed || webhook.lists.includes(listID);
  // } else {
  //   // Blacklist policy
  //   allowed = true;

  //   if (webhook.cards.length) allowed = !webhook.cards.includes(card.id);
  //   if (webhook.lists.length && listID) allowed = !(!allowed || webhook.lists.includes(listID));
  // }

  return allowed;
}

export const headRoute: RouteOptions = {
  method: 'HEAD',
  url: '/:id',
  handler: async (request, reply) => {
    const { id } = request.params as { id: string };
    if (!/^[0-9a-f]{24}$/.test(id)) return reply.status(400).send('Bad request');
    else return reply.status(200).send('Ready to recieve.');
  }
};

export const route: RouteOptions = {
  method: 'POST',
  url: '/:id',
  handler: async (request, reply) => {
    const { id } = request.params as { id: string };

    if (!/^[0-9a-f]{24}$/.test(id)) return reply.status(400).send('Bad request');

    const ip = (request.headers['x-forwarded-for'] as string) || request.ip;

    if (whitelistedIPs.length && !whitelistedIPs.includes(ip)) {
      return reply.status(401).send('Unauthorized');
    }

    // if (!validateRequest(request)) {
    //   logger.info(`Failed webhook validation from request @ ${id}`, ip);
    //   return reply.status(401).send('Validation failed');
    // }

    const body = request.body as TrelloPayload<TrelloDefaultAction>;
    const [filter, filterFound] = findFilter(body);

    const transaction = startTransaction({
      op: 'webhook.post',
      name: `Board ${body.model.shortUrl.split('/')[4]} posted: ${filter}`
    });

    configureScope((scope) => {
      scope.setSpan(transaction);
      scope.setTag('request.ownerID', id);
      scope.setTag('request.filter', filter);
      scope.setTag('request.filterFound', filterFound);
      scope.setTag('request.board', body.model.shortUrl.split('/')[4]);
      scope.setExtra('request.ip', ip);
    });

    logger.log(
      `Incoming request @ ip=${ip} memberID=${id} modelID=${body.model.id} board=${body.model.shortUrl} filter=${filter}`,
      body.action.data
    );

    try {
      addBreadcrumb({
        category: 'filter',
        message: `Using filter: ${body.action.type} / ${filter}`,
        level: 'info',
        data: body.action.data
      });

      if (!filterFound) {
        logger.info(`Unknown filter: ${body.action.type} / ${filter}`, body.action.data);
        transaction.finish();
        return reply.status(200).send('Recieved');
      }

      const webhooks = await Webhook.findAll({
        where: {
          modelID: body.model.id,
          memberID: id,
          active: true
        }
      });

      logger.info(`Found ${webhooks.length} webhooks for board ${body.model.id}`);
      logger.debug(webhooks);

      await Promise.all(
        webhooks.map(async (webhook) => {
          const data = new WebhookData(request, webhook, filter);
          const filters = new WebhookFilters(BigInt(webhook.filters));

          const allowed = await canBeSent(webhook, body);
          const postEvent = allowed && filters.has(filter) && webhook.webhookID;

          addBreadcrumb({
            category: 'webhook',
            message: `Webhook ${webhook.webhookID} ${
              allowed ? (postEvent ? 'posting' : 'allowed') : 'denied'
            }`,
            level: 'info',
            data: {
              ...webhook.toJSON(),
              webhookToken: '<hidden>'
            }
          });

          logger.debug(
            `Webhook ${webhook.webhookID} ${allowed ? (postEvent ? 'posting' : 'allowed') : 'denied'}`
          );

          logger.debug(data);

          if (postEvent) {
            const eventDebug = await events.get(filter).onEvent(data);
            logger.debug(eventDebug);
            return eventDebug;
          }
        })
      );

      reply.status(200).send('Recieved');
    } catch (e) {
      captureException(e);
      logger.error(e);
      reply.status(500).send('Internal error');
    } finally {
      transaction.finish();
    }
  }
};
