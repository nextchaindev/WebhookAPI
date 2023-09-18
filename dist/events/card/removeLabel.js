"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.event = void 0;
const util_1 = require("../../util");
exports.event = {
    name: 'REMOVE_LABEL_FROM_CARD',
    async onEvent(data) {
        const _ = data.locale;
        return data.send({
            default: {
                title: _('webhooks.card_remove_label', {
                    member: data.invoker.webhookSafeName,
                    label: (0, util_1.cutoffText)(data.label.name, 25),
                    card: (0, util_1.cutoffText)(data.card.name, 50)
                }),
                description: data.embedDescription(['label', 'card', 'list'])
            },
            small: {
                description: _('webhooks.card_remove_label', {
                    member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username}?utm_source=tacobot.app)`,
                    label: (0, util_1.cutoffText)(data.label.name, 25),
                    card: `[${(0, util_1.cutoffText)(data.card.name, 25)}](https://trello.com/c/${data.card.shortLink}?utm_source=tacobot.app)`
                })
            }
        });
    }
};
//# sourceMappingURL=removeLabel.js.map