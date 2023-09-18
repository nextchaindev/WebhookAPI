"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.event = void 0;
const util_1 = require("../../util");
exports.event = {
    name: 'UPDATE_CUSTOM_FIELD_NAME',
    async onEvent(data) {
        const _ = data.locale;
        return data.send({
            default: {
                title: _('webhooks.customfield_rename', {
                    member: data.invoker.webhookSafeName,
                    customField: (0, util_1.cutoffText)(data.customField.name, 50),
                    oldName: (0, util_1.cutoffText)(data.oldData.name, 50)
                }),
                description: ''
            },
            small: {
                description: _('webhooks.customfield_rename', {
                    member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username}?utm_source=tacobot.app)`,
                    customField: (0, util_1.cutoffText)(data.customField.name, 25),
                    oldName: (0, util_1.cutoffText)(data.oldData.name, 25)
                })
            }
        });
    }
};
//# sourceMappingURL=name.js.map