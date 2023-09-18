"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const tslib_1 = require("tslib");
const ts_1 = tslib_1.__importDefault(require("cat-loggr/ts"));
exports.logger = new ts_1.default({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
});
//# sourceMappingURL=logger.js.map