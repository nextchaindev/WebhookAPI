"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.close = void 0;
const tslib_1 = require("tslib");
require("@sentry/tracing");
const integrations_1 = require("@sentry/integrations");
const Sentry = tslib_1.__importStar(require("@sentry/node"));
Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new integrations_1.RewriteFrames({
            root: __dirname
        })
    ],
    environment: process.env.SENTRY_ENV || process.env.NODE_ENV || 'development',
    release: `webhook-api@${require('../package.json').version}`,
    tracesSampleRate: process.env.SENTRY_SAMPLE_RATE ? parseFloat(process.env.SENTRY_SAMPLE_RATE) : 1.0
});
function close() {
    return Sentry.close();
}
exports.close = close;
//# sourceMappingURL=sentry.js.map