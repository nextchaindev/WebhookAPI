"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.event = void 0;
const util_1 = require("../../util");
exports.event = {
    name: 'ADD_ATTACHMENT_TO_CARD',
    async onEvent(data) {
        const _ = data.locale;
        return data.send({
            default: {
                title: _('webhooks.attach_card', {
                    member: data.invoker.webhookSafeName,
                    card: (0, util_1.cutoffText)(data.card.name, 50),
                    attachment: (0, util_1.cutoffText)(data.attachment.name, 50)
                }),
                description: data.embedDescription(['attachment', 'card', 'list']),
                image: data.attachment.url && data.attachment.url.startsWith(util_1.IMAGE_ATTACHMENT_HOST) ? { url: data.attachment.url } : null
            },
            small: {
                description: _('webhooks.attach_card', {
                    member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username}?utm_source=tacobot.app)`,
                    card: `[${(0, util_1.cutoffText)(data.card.name, 25)}](https://trello.com/c/${data.card.shortLink}?utm_source=tacobot.app)`,
                    attachment: (0, util_1.cutoffText)(data.attachment.name, 25)
                }),
                thumbnail: data.attachment.url && data.attachment.url.startsWith(util_1.IMAGE_ATTACHMENT_HOST) ? { url: data.attachment.url } : null
            }
        });
    }
};
//# sourceMappingURL=create.js.map