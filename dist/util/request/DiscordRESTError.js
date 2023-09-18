"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DiscordRESTError extends Error {
    constructor(req, res, response, stack) {
        super();
        this.req = req;
        this.res = res;
        this.response = response;
        this.status = res.statusCode;
        this.code = response.code || 0;
        let message = response.message || 'Unknown error';
        if (response.errors)
            message += '\n  ' + this.flattenErrors(response.errors).join('\n  ');
        else {
            const errors = this.flattenErrors(response);
            if (errors.length > 0)
                message += '\n  ' + errors.join('\n  ');
        }
        this.message = message;
        if (stack)
            this.stack = this.name + ': ' + this.message + '\n' + stack;
        else {
            this.stack = '';
            Error.captureStackTrace(this, DiscordRESTError);
        }
    }
    get name() {
        return `${this.constructor.name} [${this.code}]`;
    }
    flattenErrors(errors, keyPrefix = '') {
        let messages = [];
        for (const fieldName in errors) {
            if (!(fieldName in errors) || fieldName === 'message' || fieldName === 'code') {
                continue;
            }
            if (errors[fieldName]._errors) {
                messages = messages.concat(errors[fieldName]._errors.map((obj) => `${keyPrefix + fieldName}: ${obj.message}`));
            }
            else if (Array.isArray(errors[fieldName])) {
                messages = messages.concat(errors[fieldName].map((str) => `${keyPrefix + fieldName}: ${str}`));
            }
            else if (typeof errors[fieldName] === 'object') {
                messages = messages.concat(this.flattenErrors(errors[fieldName], keyPrefix + fieldName + '.'));
            }
        }
        return messages;
    }
}
exports.default = DiscordRESTError;
//# sourceMappingURL=DiscordRESTError.js.map