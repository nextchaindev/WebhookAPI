"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.event = void 0;
const util_1 = require("../../../util");
exports.event = {
    name: 'UPDATE_CHECK_ITEM_STATE_ON_CARD',
    async onEvent(data) {
        const _ = data.locale;
        return data.send({
            default: {
                title: _(data.checklistItem.state === 'complete' ? 'webhooks.checkitem_state_on' : 'webhooks.checkitem_state_off', {
                    member: data.invoker.webhookSafeName,
                    card: (0, util_1.cutoffText)(data.card.name, 50),
                    checklistItem: (0, util_1.cutoffText)(data.checklistItem.name, 50)
                }),
                description: data.embedDescription(['card', 'list', 'checklist', 'checklistItem'])
            },
            small: {
                description: _(data.checklistItem.state === 'complete' ? 'webhooks.checkitem_state_on' : 'webhooks.checkitem_state_off', {
                    member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username}?utm_source=tacobot.app)`,
                    card: `[${(0, util_1.cutoffText)(data.card.name, 25)}](https://trello.com/c/${data.card.shortLink}?utm_source=tacobot.app)`,
                    checklistItem: (0, util_1.cutoffText)(data.checklistItem.name, 25)
                })
            }
        });
    }
};
//# sourceMappingURL=updateState.js.map