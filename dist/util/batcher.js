"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const eventemitter3_1 = tslib_1.__importDefault(require("eventemitter3"));
class Batcher extends eventemitter3_1.default {
    constructor(options) {
        super();
        this._arr = [];
        this.maxTime = options.maxTime;
        this.maxSize = options.maxSize;
        this._lastFlush = Date.now();
    }
    _flush() {
        clearTimeout(this._timeout);
        this._lastFlush = Date.now();
        this.emit('batch', this._arr);
        this._arr = [];
    }
    add(data) {
        this._arr.push(data);
        if (this._arr.length === this.maxSize) {
            this._flush();
        }
        else if (this.maxTime != null && this._arr.length === 1) {
            this._timeout = setTimeout(() => {
                return this._flush();
            }, this.maxTime);
        }
    }
}
exports.default = Batcher;
//# sourceMappingURL=batcher.js.map