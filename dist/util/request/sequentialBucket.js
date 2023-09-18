"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("../../db/redis");
class SequentialBucket {
    constructor(route, limit, latencyRef = { latency: 0 }) {
        this.processing = false;
        this.reset = 0;
        this._queue = [];
        this.route = route;
        this.limit = this.remaining = limit;
        this.latencyRef = latencyRef;
    }
    get redisKey() {
        return `bucket:${this.route}`;
    }
    async setValues({ remaining, reset } = {}) {
        const args = [];
        if (remaining !== undefined) {
            args.push('remaining', this.remaining);
            this.remaining = remaining;
        }
        if (reset !== undefined) {
            args.push('reset', this.reset);
            this.reset = reset;
        }
        if (redis_1.available) {
            await redis_1.client.hset(this.redisKey, ...args);
            if (reset !== undefined) {
                const now = Date.now();
                const offset = this.latencyRef.latency + (this.latencyRef.offset || 0);
                await redis_1.client.pexpire(this.redisKey, reset - (now - offset));
            }
        }
    }
    async decreaseRemaining() {
        if (redis_1.available) {
            this.remaining = await redis_1.client.hincrby(this.redisKey, 'remaining', -1);
        }
        else
            --this.remaining;
    }
    async sync() {
        if (redis_1.available) {
            const [remaining, reset] = await redis_1.client.hmget(this.redisKey, 'remaining', 'reset');
            if (remaining)
                this.remaining = parseInt(remaining, 10);
            if (reset)
                this.reset = parseInt(reset, 10);
        }
    }
    async check(override = false) {
        if (this._queue.length === 0) {
            if (this.processing) {
                clearTimeout(this.processingTimeout);
                this.processing = false;
            }
            return;
        }
        if (this.processing && !override) {
            return;
        }
        await this.sync();
        const now = Date.now();
        const offset = this.latencyRef.latency + (this.latencyRef.offset || 0);
        if (!this.reset || this.reset < now - offset) {
            this.reset = now - offset;
            this.remaining = this.limit;
        }
        this.last = now;
        if (this.remaining <= 0) {
            this.processingTimeout = setTimeout(() => {
                this.processing = false;
                this.check(true);
            }, Math.max(0, (this.reset || 0) - now + offset) + 1);
            return;
        }
        await this.decreaseRemaining();
        this.processing = true;
        this._queue.shift()(() => {
            if (this._queue.length > 0) {
                this.check(true);
            }
            else {
                this.processing = false;
            }
        });
    }
    queue(func, short = false) {
        if (short) {
            this._queue.unshift(func);
        }
        else {
            this._queue.push(func);
        }
        this.check();
    }
    toString() {
        return '[SequentialBucket]';
    }
}
exports.default = SequentialBucket;
//# sourceMappingURL=sequentialBucket.js.map