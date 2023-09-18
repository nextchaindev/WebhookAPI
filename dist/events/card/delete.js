"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.event = void 0;
const util_1 = require("../../util");
exports.event = {
    name: 'DELETE_CARD',
    async onEvent(data) {
        const _ = data.locale;
        return data.send({
            default: {
                title: _('webhooks.delete_card', {
                    member: data.invoker.webhookSafeName,
                    cardID: data.card.shortLink
                }),
                description: data.embedDescription(['list'])
            },
            small: {
                description: _('webhooks_extended.delete_card', {
                    member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username}?utm_source=tacobot.app)`,
                    cardID: data.card.shortLink,
                    list: (0, util_1.cutoffText)(data.list.name, 25)
                })
            }
        });
    }
};
//# sourceMappingURL=delete.js.map