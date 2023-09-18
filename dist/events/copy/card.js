"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.event = void 0;
const util_1 = require("../../util");
exports.event = {
    name: 'COPY_CARD',
    async onEvent(data) {
        const _ = data.locale;
        return data.send({
            default: {
                title: _('webhooks.copy_card', {
                    member: data.invoker.webhookSafeName,
                    sourceCard: (0, util_1.cutoffText)(data.sourceCard.name, 50),
                    card: (0, util_1.cutoffText)(data.card.name, 50)
                }),
                description: data.embedDescription(['card', 'list'])
            },
            small: {
                description: _('webhooks.copy_card', {
                    member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username}?utm_source=tacobot.app)`,
                    sourceCard: `[${(0, util_1.cutoffText)(data.sourceCard.name, 25)}](https://trello.com/c/${data.sourceCard.shortLink}?utm_source=tacobot.app)`,
                    card: `[${(0, util_1.cutoffText)(data.card.name, 25)}](https://trello.com/c/${data.card.shortLink}?utm_source=tacobot.app)`
                })
            }
        });
    }
};
//# sourceMappingURL=card.js.map