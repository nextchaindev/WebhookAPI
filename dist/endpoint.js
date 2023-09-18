"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.route = exports.headRoute = exports.whitelistedIPs = void 0;
const tslib_1 = require("tslib");
const node_1 = require("@sentry/node");
const crypto_1 = require("crypto");
const postgres_1 = require("./db/postgres");
const logger_1 = require("./logger");
const events_1 = require("./util/events");
const webhookData_1 = tslib_1.__importDefault(require("./util/webhookData"));
const webhookFilters_1 = tslib_1.__importDefault(require("./util/webhookFilters"));
exports.whitelistedIPs = process.env.WHITELISTED_IPS ? process.env.WHITELISTED_IPS.split(',') : [];
function validateRequest(request) {
    const { id } = request.params;
    const content = JSON.stringify(request.body) + process.env.API_URL + id;
    const hash = (0, crypto_1.createHmac)('sha1', process.env.TRELLO_SECRET).update(content).digest('base64');
    return hash === request.headers['x-trello-webhook'];
}
async function canBeSent(webhook, body) {
    const actionData = body.action.data;
    const boardID = body.model.id;
    const list = actionData.list || actionData.listAfter;
    let listID = list ? list.id : null;
    const card = actionData.card;
    if (!card)
        return true;
    let allowed = true;
    return allowed;
}
exports.headRoute = {
    method: 'HEAD',
    url: '/:id',
    handler: async (request, reply) => {
        const { id } = request.params;
        if (!/^[0-9a-f]{24}$/.test(id))
            return reply.status(400).send('Bad request');
        else
            return reply.status(200).send('Ready to recieve.');
    }
};
exports.route = {
    method: 'POST',
    url: '/:id',
    handler: async (request, reply) => {
        const { id } = request.params;
        if (!/^[0-9a-f]{24}$/.test(id))
            return reply.status(400).send('Bad request');
        const ip = request.headers['x-forwarded-for'] || request.ip;
        if (exports.whitelistedIPs.length && !exports.whitelistedIPs.includes(ip)) {
            return reply.status(401).send('Unauthorized');
        }
        const body = request.body;
        const [filter, filterFound] = (0, events_1.findFilter)(body);
        const transaction = (0, node_1.startTransaction)({
            op: 'webhook.post',
            name: `Board ${body.model.shortUrl.split('/')[4]} posted: ${filter}`
        });
        (0, node_1.configureScope)((scope) => {
            scope.setSpan(transaction);
            scope.setTag('request.ownerID', id);
            scope.setTag('request.filter', filter);
            scope.setTag('request.filterFound', filterFound);
            scope.setTag('request.board', body.model.shortUrl.split('/')[4]);
            scope.setExtra('request.ip', ip);
        });
        logger_1.logger.log(`Incoming request @ ip=${ip} memberID=${id} modelID=${body.model.id} board=${body.model.shortUrl} filter=${filter}`, body.action.data);
        try {
            (0, node_1.addBreadcrumb)({
                category: 'filter',
                message: `Using filter: ${body.action.type} / ${filter}`,
                level: 'info',
                data: body.action.data
            });
            if (!filterFound) {
                logger_1.logger.info(`Unknown filter: ${body.action.type} / ${filter}`, body.action.data);
                transaction.finish();
                return reply.status(200).send('Recieved');
            }
            const webhooks = await postgres_1.Webhook.findAll({
                where: {
                    modelID: body.model.id,
                    memberID: id,
                    active: true
                }
            });
            await Promise.all(webhooks.map(async (webhook) => {
                const data = new webhookData_1.default(request, webhook, filter);
                const filters = new webhookFilters_1.default(BigInt(webhook.filters));
                const allowed = await canBeSent(webhook, body);
                const postEvent = allowed && filters.has(filter) && webhook.webhookID;
                (0, node_1.addBreadcrumb)({
                    category: 'webhook',
                    message: `Webhook ${webhook.webhookID} ${allowed ? (postEvent ? 'posting' : 'allowed') : 'denied'}`,
                    level: 'info',
                    data: {
                        ...webhook.toJSON(),
                        webhookToken: '<hidden>'
                    }
                });
                if (postEvent)
                    return events_1.events.get(filter).onEvent(data);
            }));
            reply.status(200).send('Recieved');
        }
        catch (e) {
            (0, node_1.captureException)(e);
            logger_1.logger.error(e);
            reply.status(500).send('Internal error');
        }
        finally {
            transaction.finish();
        }
    }
};
//# sourceMappingURL=endpoint.js.map