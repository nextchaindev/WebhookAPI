"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.event = void 0;
const util_1 = require("../../util");
exports.event = {
    name: 'UPDATE_LABEL_NAME',
    async onEvent(data) {
        const _ = data.locale;
        return data.send({
            default: {
                title: _('webhooks.label_rename', {
                    member: data.invoker.webhookSafeName,
                    label: (0, util_1.cutoffText)(data.label.name, 50),
                    oldName: (0, util_1.cutoffText)(data.oldData.name, 50)
                }),
                description: data.embedDescription(['label'])
            },
            small: {
                description: _('webhooks.label_rename', {
                    member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username}?utm_source=tacobot.app)`,
                    label: (0, util_1.cutoffText)(data.label.name, 25),
                    oldName: (0, util_1.cutoffText)(data.oldData.name, 25)
                })
            }
        });
    }
};
//# sourceMappingURL=name.js.map