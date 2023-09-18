"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.event = void 0;
const util_1 = require("../../../util");
exports.event = {
    name: 'CONVERT_TO_CARD_FROM_CHECK_ITEM',
    async onEvent(data) {
        const _ = data.locale;
        return data.send({
            default: {
                title: _('webhooks.checkitem_tocard', {
                    member: data.invoker.webhookSafeName,
                    card: (0, util_1.cutoffText)(data.card.name, 50)
                }),
                description: data.embedDescription(['card', 'list']),
                fields: [
                    {
                        name: '*' + _('trello.item_src') + '*',
                        value: [
                            `**${_('words.card.one')}:** [${(0, util_1.cutoffText)((0, util_1.escapeMarkdown)(data.sourceCard.name), 50)}](https://trello.com/c/${data.sourceCard.shortLink})`,
                            `**${_('words.checklist.one')}:** ${(0, util_1.cutoffText)((0, util_1.escapeMarkdown)(data.checklist.name), 50)}`
                        ].join('\n')
                    }
                ]
            },
            small: {
                description: _('webhooks.checkitem_tocard', {
                    member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username}?utm_source=tacobot.app)`,
                    card: `[${(0, util_1.cutoffText)(data.card.name, 25)}](https://trello.com/c/${data.card.shortLink}?utm_source=tacobot.app)`
                })
            }
        });
    }
};
//# sourceMappingURL=toCard.js.map