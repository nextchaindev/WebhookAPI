"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.event = void 0;
const util_1 = require("../../util");
exports.event = {
    name: 'REMOVE_MEMBER_FROM_CARD',
    async onEvent(data) {
        const _ = data.locale;
        return data.send({
            default: {
                title: _(data.invoker.id === data.member.id ? 'webhooks.card_remove_self' : 'webhooks.card_remove_member', {
                    member: data.invoker.webhookSafeName,
                    member2: data.member.webhookSafeName,
                    card: (0, util_1.cutoffText)(data.card.name, 50)
                }),
                description: data.embedDescription(['member', 'card', 'list'])
            },
            small: {
                description: _(data.invoker.id === data.member.id ? 'webhooks.card_remove_self' : 'webhooks.card_remove_member', {
                    member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username}?utm_source=tacobot.app)`,
                    member2: `[${data.member.webhookSafeName}](https://trello.com/${data.member.username}?utm_source=tacobot.app)`,
                    card: `[${(0, util_1.cutoffText)(data.card.name, 25)}](https://trello.com/c/${data.card.shortLink}?utm_source=tacobot.app)`
                })
            }
        });
    }
};
//# sourceMappingURL=removeMember.js.map