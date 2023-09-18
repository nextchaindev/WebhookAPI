"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.event = void 0;
const util_1 = require("../../../util");
exports.event = {
    name: 'UPDATE_CHECK_ITEM_NAME',
    async onEvent(data) {
        const _ = data.locale;
        return data.send({
            default: {
                title: _('webhooks.checkitem_rename', {
                    member: data.invoker.webhookSafeName,
                    card: (0, util_1.cutoffText)(data.card.name, 50)
                }),
                description: data.embedDescription(['card', 'list', 'checklist', 'checklistItem']) +
                    `\n**${_('trello.one_chkitem_name')}:** ${(0, util_1.cutoffText)((0, util_1.escapeMarkdown)(data.oldData.name), 50)}`
            },
            small: {
                description: _('webhooks.checkitem_rename', {
                    member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username}?utm_source=tacobot.app)`,
                    card: `[${(0, util_1.cutoffText)(data.card.name, 25)}](https://trello.com/c/${data.card.shortLink}?utm_source=tacobot.app)`
                })
            }
        });
    }
};
//# sourceMappingURL=name.js.map