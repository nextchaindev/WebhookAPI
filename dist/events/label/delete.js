"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.event = void 0;
exports.event = {
    name: 'DELETE_LABEL',
    async onEvent(data) {
        const _ = data.locale;
        return data.send({
            default: {
                title: _('webhooks.delete_label', {
                    member: data.invoker.webhookSafeName,
                    labelID: data.label.id
                }),
                description: ''
            },
            small: {
                description: _('webhooks.delete_label', {
                    member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username}?utm_source=tacobot.app)`,
                    labelID: data.label.id
                })
            }
        });
    }
};
//# sourceMappingURL=delete.js.map