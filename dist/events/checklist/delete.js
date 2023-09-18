"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.event = void 0;
const util_1 = require("../../util");
exports.event = {
    name: 'REMOVE_CHECKLIST_FROM_CARD',
    async onEvent(data) {
        const _ = data.locale;
        return data.send({
            default: {
                title: _('webhooks.checklist_delete', {
                    member: data.invoker.webhookSafeName,
                    card: (0, util_1.cutoffText)(data.card.name, 50),
                    checklist: (0, util_1.cutoffText)(data.checklist.name, 50)
                }),
                description: data.embedDescription(['card', 'list', 'checklist'])
            },
            small: {
                description: _('webhooks.checklist_delete', {
                    member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username}?utm_source=tacobot.app)`,
                    card: `[${(0, util_1.cutoffText)(data.card.name, 25)}](https://trello.com/c/${data.card.shortLink}?utm_source=tacobot.app)`,
                    checklist: (0, util_1.cutoffText)(data.checklist.name, 25)
                })
            }
        });
    }
};
//# sourceMappingURL=delete.js.map