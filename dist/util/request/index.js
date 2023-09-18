"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.request = exports.cleanBuckets = exports.API_BASE_URL = exports.API_VERSION = exports.USER_AGENT = void 0;
const tslib_1 = require("tslib");
const https_1 = tslib_1.__importDefault(require("https"));
const zlib_1 = tslib_1.__importDefault(require("zlib"));
const logger_1 = require("../../logger");
const DiscordHTTPError_1 = tslib_1.__importDefault(require("./DiscordHTTPError"));
const DiscordRESTError_1 = tslib_1.__importDefault(require("./DiscordRESTError"));
const multipartData_1 = tslib_1.__importDefault(require("./multipartData"));
const sequentialBucket_1 = tslib_1.__importDefault(require("./sequentialBucket"));
exports.USER_AGENT = `DiscordBot (https://github.com/trello-talk/WebhookAPI, ${require('../../../package.json').version})`;
exports.API_VERSION = 8;
exports.API_BASE_URL = `/api/v${exports.API_VERSION}`;
function cleanBuckets() {
    for (const route in ratelimits) {
        const bucket = ratelimits[route];
        if (bucket.reset < Date.now())
            delete ratelimits[route];
    }
}
exports.cleanBuckets = cleanBuckets;
const requestTimeout = parseInt(process.env.REQUEST_TIMEOUT, 10) || 15000;
const latencyThreshold = parseInt(process.env.LATENCY_THRESHOLD, 10) || 30000;
const ratelimits = {};
const latencyRef = {
    latency: 500,
    offset: parseInt(process.env.RATELIMITER_OFFSET, 10) || 0,
    raw: new Array(10).fill(500),
    timeOffset: 0,
    timeOffsets: new Array(10).fill(0),
    lastTimeOffsetCheck: 0
};
function getRoute(url) {
    const route = url.replace(/^\/webhooks\/(\d+)\/[A-Za-z0-9-_]{64,}/, '/webhooks/$1/:token');
    return route;
}
function request(method, url, body, file, short = false) {
    const route = getRoute(url);
    const _stackHolder = { stack: '' };
    Error.captureStackTrace(_stackHolder);
    return new Promise((resolve, reject) => {
        let attempts = 0;
        const actualCall = (cb) => {
            const headers = {
                'User-Agent': exports.USER_AGENT,
                'Accept-Encoding': 'gzip,deflate',
                'X-RateLimit-Precision': 'millisecond'
            };
            let data;
            const finalURL = url;
            try {
                if (file) {
                    if (Array.isArray(file)) {
                        data = new multipartData_1.default();
                        headers['Content-Type'] = 'multipart/form-data; boundary=' + data.boundary;
                        file.forEach((f) => {
                            if (!f.file) {
                                return;
                            }
                            data.attach(f.name, f.file, f.name);
                        });
                        if (body)
                            data.attach('payload_json', body);
                        data = data.finish();
                    }
                    else if (file.file) {
                        data = new multipartData_1.default();
                        headers['Content-Type'] = 'multipart/form-data; boundary=' + data.boundary;
                        data.attach('file', file.file, file.name);
                        if (body)
                            data.attach('payload_json', body);
                        data = data.finish();
                    }
                    else {
                        throw new Error('Invalid file object');
                    }
                }
                else if (body) {
                    if (method !== 'GET' && method !== 'DELETE') {
                        data = JSON.stringify(body);
                        headers['Content-Type'] = 'application/json';
                    }
                }
            }
            catch (err) {
                cb();
                reject(err);
                return;
            }
            const req = https_1.default.request({
                method,
                host: 'discord.com',
                path: exports.API_BASE_URL + finalURL,
                headers: headers
            });
            let reqError;
            req
                .once('abort', () => {
                cb();
                reqError = reqError || new Error(`Request aborted by client on ${method} ${url}`);
                reqError.req = req;
                reject(reqError);
            })
                .once('error', (err) => {
                reqError = err;
                req.destroy();
            });
            let latency = Date.now();
            req.once('response', (resp) => {
                latency = Date.now() - latency;
                latencyRef.raw.push(latency);
                latencyRef.latency = latencyRef.latency - ~~(latencyRef.raw.shift() / 10) + ~~(latency / 10);
                const headerNow = Date.parse(resp.headers['date']);
                if (latencyRef.lastTimeOffsetCheck < Date.now() - 5000) {
                    const timeOffset = headerNow + 500 - (latencyRef.lastTimeOffsetCheck = Date.now());
                    if (latencyRef.timeOffset - latencyRef.latency >= latencyThreshold && timeOffset - latencyRef.latency >= latencyThreshold) {
                        logger_1.logger.warn(`Your clock is ${latencyRef.timeOffset}ms behind Discord's server clock. Please check your connection and system time.`);
                    }
                    latencyRef.timeOffset = latencyRef.timeOffset - ~~(latencyRef.timeOffsets.shift() / 10) + ~~(timeOffset / 10);
                    latencyRef.timeOffsets.push(timeOffset);
                }
                resp.once('aborted', () => {
                    cb();
                    reqError = reqError || new Error(`Request aborted by server on ${method} ${url}`);
                    reqError.req = req;
                    reject(reqError);
                });
                let response = '';
                let _respStream = resp;
                if (resp.headers['content-encoding']) {
                    if (resp.headers['content-encoding'].includes('gzip')) {
                        _respStream = resp.pipe(zlib_1.default.createGunzip());
                    }
                    else if (resp.headers['content-encoding'].includes('deflate')) {
                        _respStream = resp.pipe(zlib_1.default.createInflate());
                    }
                }
                _respStream
                    .on('data', (str) => {
                    response += str;
                })
                    .on('error', (err) => {
                    reqError = err;
                    req.destroy();
                })
                    .once('end', async () => {
                    const now = Date.now();
                    if (resp.headers['x-ratelimit-limit'])
                        ratelimits[route].limit = +resp.headers['x-ratelimit-limit'];
                    if (method !== 'GET' &&
                        (resp.headers['x-ratelimit-remaining'] == undefined || resp.headers['x-ratelimit-limit'] == undefined) &&
                        ratelimits[route].limit !== 1) {
                        logger_1.logger.debug(`Missing ratelimit headers for SequentialBucket(${ratelimits[route].remaining}/${ratelimits[route].limit}) with non-default limit\n` +
                            `${resp.statusCode} ${resp.headers['content-type']}: ${method} ${route} | ${resp.headers['cf-ray']}\n` +
                            'content-type = ' +
                            '\n' +
                            'x-ratelimit-remaining = ' +
                            resp.headers['x-ratelimit-remaining'] +
                            '\n' +
                            'x-ratelimit-limit = ' +
                            resp.headers['x-ratelimit-limit'] +
                            '\n' +
                            'x-ratelimit-reset = ' +
                            resp.headers['x-ratelimit-reset'] +
                            '\n' +
                            'x-ratelimit-global = ' +
                            resp.headers['x-ratelimit-global']);
                    }
                    await ratelimits[route].setValues({
                        remaining: resp.headers['x-ratelimit-remaining'] === undefined ? 1 : +resp.headers['x-ratelimit-remaining'] || 0
                    });
                    let retryAfter = parseInt(resp.headers['retry-after']);
                    if (retryAfter && (typeof resp.headers['via'] !== 'string' || !resp.headers['via'].includes('1.1 google'))) {
                        retryAfter *= 1000;
                        if (retryAfter >= 1000 * 1000) {
                            logger_1.logger.warn(`Excessive Retry-After interval detected (Retry-After: ${resp.headers['retry-after']} * 1000, Via: ${resp.headers['via']})`);
                        }
                    }
                    if (retryAfter >= 0) {
                        if (resp.headers['x-ratelimit-global']) {
                            this.globalBlock = true;
                            setTimeout(() => this.globalUnblock(), retryAfter || 1);
                        }
                        else
                            await ratelimits[route].setValues({
                                reset: (retryAfter || 1) + now
                            });
                    }
                    else if (resp.headers['x-ratelimit-reset']) {
                        if (~route.lastIndexOf('/reactions/:id') && +resp.headers['x-ratelimit-reset'] * 1000 - headerNow === 1000)
                            await ratelimits[route].setValues({
                                reset: now + 250
                            });
                        else
                            await ratelimits[route].setValues({
                                reset: Math.max(+resp.headers['x-ratelimit-reset'] * 1000 - latencyRef.timeOffset, now)
                            });
                    }
                    else
                        await ratelimits[route].setValues({
                            reset: now
                        });
                    if (resp.statusCode !== 429) {
                        logger_1.logger.debug(`${now} ${route} ${resp.statusCode}: ${latency}ms (${latencyRef.latency}ms avg) | ${ratelimits[route].remaining}/${ratelimits[route].limit} left | Reset ${ratelimits[route].reset} (${ratelimits[route].reset - now}ms left)`);
                    }
                    if (resp.statusCode >= 300) {
                        if (resp.statusCode === 429) {
                            logger_1.logger.debug(`${resp.headers['x-ratelimit-global'] ? 'Global' : 'Unexpected'} 429 (╯°□°）╯︵ ┻━┻: ${response}\n${body && body.content} ${now} ${route} ${resp.statusCode}: ${latency}ms (${latencyRef.latency}ms avg) | ${ratelimits[route].remaining}/${ratelimits[route].limit} left | Reset ${ratelimits[route].reset} (${ratelimits[route].reset - now}ms left)`);
                            if (response) {
                                try {
                                    response = JSON.parse(response);
                                    if (response.retry_after)
                                        retryAfter = response.retry_after * 1000 + 250;
                                }
                                catch (err) {
                                    reject(err);
                                    return;
                                }
                            }
                            if (retryAfter) {
                                setTimeout(() => {
                                    cb();
                                    request(method, url, body, file, true).then(resolve).catch(reject);
                                }, retryAfter);
                                return;
                            }
                            else {
                                cb();
                                request(method, url, body, file, true).then(resolve).catch(reject);
                                return;
                            }
                        }
                        else if (resp.statusCode === 502 && ++attempts < 4) {
                            logger_1.logger.warn('A wild 502 appeared! Thanks CloudFlare!');
                            setTimeout(() => {
                                request(method, url, body, file, true).then(resolve).catch(reject);
                            }, Math.floor(Math.random() * 1900 + 100));
                            return cb();
                        }
                        cb();
                        if (response.length > 0) {
                            if (resp.headers['content-type'] === 'application/json') {
                                try {
                                    response = JSON.parse(response);
                                }
                                catch (err) {
                                    reject(err);
                                    return;
                                }
                            }
                        }
                        let { stack } = _stackHolder;
                        if (stack.startsWith('Error\n')) {
                            stack = stack.substring(6);
                        }
                        let err;
                        if (response.code) {
                            err = new DiscordRESTError_1.default(req, resp, response, stack);
                        }
                        else {
                            err = new DiscordHTTPError_1.default(req, resp, response, stack);
                        }
                        reject(err);
                        return;
                    }
                    if (response.length > 0) {
                        if (resp.headers['content-type'] === 'application/json') {
                            try {
                                response = JSON.parse(response);
                            }
                            catch (err) {
                                cb();
                                reject(err);
                                return;
                            }
                        }
                    }
                    cb();
                    resolve(response);
                });
            });
            req.setTimeout(requestTimeout, () => {
                reqError = new Error(`Request timed out (>${requestTimeout}ms) on ${method} ${url}`);
                req.destroy();
            });
            if (Array.isArray(data)) {
                for (const chunk of data)
                    req.write(chunk);
                req.end();
            }
            else
                req.end(data);
        };
        if (!ratelimits[route]) {
            ratelimits[route] = new sequentialBucket_1.default(route, 1, latencyRef);
        }
        ratelimits[route].queue(actualCall, short);
    });
}
exports.request = request;
//# sourceMappingURL=index.js.map