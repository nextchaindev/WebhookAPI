"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cron = exports.getListID = exports.cleanListIDCache = exports.cacheCronTick = exports.cardListMapCache = void 0;
const tslib_1 = require("tslib");
const axios_1 = tslib_1.__importDefault(require("axios"));
const cron_1 = require("cron");
const postgres_1 = require("./db/postgres");
const redis_1 = require("./db/redis");
const logger_1 = require("./logger");
const request_1 = require("./util/request");
exports.cardListMapCache = new Map();
function cacheCronTick() {
    cleanListIDCache();
    (0, request_1.cleanBuckets)();
}
exports.cacheCronTick = cacheCronTick;
function cleanListIDCache() {
    Array.from(exports.cardListMapCache).forEach(([cardID, [timestamp]]) => {
        if (timestamp < Date.now() + 1000 * 60 * 60 * 24)
            exports.cardListMapCache.delete(cardID);
    });
}
exports.cleanListIDCache = cleanListIDCache;
async function getListID(cardID, boardID, webhook) {
    if (exports.cardListMapCache.has(cardID))
        return exports.cardListMapCache.get(cardID)[1];
    if (redis_1.available) {
        const listID = await (0, redis_1.getCache)('card:' + cardID);
        if (listID)
            return listID;
    }
    const trelloMember = await (0, postgres_1.getUser)(webhook.memberID);
    if (trelloMember) {
        logger_1.logger.log(`Caching cards for board ${boardID} for member ${webhook.memberID}`);
        const response = await axios_1.default.get(`https://api.trello.com/1/boards/${boardID}/cards?filter=open&fields=idList&key=${process.env.TRELLO_KEY}&token=${process.env.TRELLO_SECRET}`);
        if (response.status !== 200) {
            exports.cardListMapCache.set(cardID, [Date.now(), null]);
            logger_1.logger.debug('Failed to cache list for card %s (board=%s, status=%s)', cardID, boardID, response.status);
            return null;
        }
        else {
            const cards = response.data;
            let resultID = null;
            for (const { id, idList } of cards) {
                if (id === cardID)
                    resultID = idList;
                if (redis_1.available) {
                    await (0, redis_1.setCache)('card:' + id, idList);
                }
                else
                    exports.cardListMapCache.set(id, [Date.now(), idList]);
            }
            return resultID;
        }
    }
    else
        return null;
}
exports.getListID = getListID;
exports.cron = new cron_1.CronJob('0 0 * * * *', cleanListIDCache, null, false, 'America/New_York');
//# sourceMappingURL=cache.js.map