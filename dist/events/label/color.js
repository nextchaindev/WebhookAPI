"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.event = void 0;
const util_1 = require("../../util");
exports.event = {
    name: 'UPDATE_LABEL_COLOR',
    async onEvent(data) {
        const _ = data.locale;
        return data.send({
            default: {
                title: _('webhooks.label_recolor', {
                    member: data.invoker.webhookSafeName,
                    label: (0, util_1.cutoffText)(data.label.name, 50),
                    oldColor: data.oldData.color ? _(`trello.label_color.${data.oldData.color}`) : _('trello.label_color.none'),
                    color: data.label.color ? _(`trello.label_color.${data.label.color}`) : _('trello.label_color.none')
                }),
                description: data.embedDescription(['label'])
            },
            small: {
                description: _('webhooks.label_recolor', {
                    member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username}?utm_source=tacobot.app)`,
                    label: (0, util_1.cutoffText)(data.label.name, 25),
                    oldColor: data.oldData.color ? _(`trello.label_color.${data.oldData.color}`) : _('trello.label_color.none'),
                    color: data.label.color ? _(`trello.label_color.${data.label.color}`) : _('trello.label_color.none')
                })
            }
        });
    }
};
//# sourceMappingURL=color.js.map