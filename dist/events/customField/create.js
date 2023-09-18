"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.event = void 0;
const util_1 = require("../../util");
exports.event = {
    name: 'CREATE_CUSTOM_FIELD',
    async onEvent(data) {
        const _ = data.locale;
        return data.send({
            default: {
                title: _('webhooks.customfield_create', {
                    member: data.invoker.webhookSafeName,
                    customField: (0, util_1.cutoffText)(data.customField.name, 50)
                }),
                description: ''
            },
            small: {
                description: _('webhooks.customfield_create', {
                    member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username}?utm_source=tacobot.app)`,
                    customField: (0, util_1.cutoffText)(data.customField.name, 25)
                })
            }
        });
    }
};
//# sourceMappingURL=create.js.map