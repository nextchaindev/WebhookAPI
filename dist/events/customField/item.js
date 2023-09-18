"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.event = void 0;
const util_1 = require("../../util");
exports.event = {
    name: 'UPDATE_CUSTOM_FIELD_ITEM',
    async onEvent(data) {
        const _ = data.locale;
        const resultData = {
            default: {
                description: data.embedDescription(['card', 'customField']),
                fields: []
            },
            small: {}
        };
        const added = data.oldData.value === null;
        const removed = data.customFieldItem.value === null;
        switch (data.customField.type) {
            case 'checkbox':
                resultData.default.title = _(`webhooks.customfielditem_checkbox_${added}`, {
                    member: data.invoker.webhookSafeName,
                    card: (0, util_1.cutoffText)(data.card.name, 50),
                    customField: (0, util_1.cutoffText)(data.customField.name, 50)
                });
                resultData.small.description = _(`webhooks.customfielditem_checkbox_${added}`, {
                    member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username}?utm_source=tacobot.app)`,
                    card: `[${(0, util_1.cutoffText)(data.card.name, 25)}](https://trello.com/c/${data.card.shortLink}?utm_source=tacobot.app)`,
                    customField: (0, util_1.cutoffText)(data.customField.name, 25)
                });
                break;
            case 'text':
                resultData.default.title = _(`webhooks.customfielditem_${!removed ? 'update' : 'remove'}`, {
                    member: data.invoker.webhookSafeName,
                    card: (0, util_1.cutoffText)(data.card.name, 50),
                    customField: (0, util_1.cutoffText)(data.customField.name, 50)
                });
                resultData.small.description = _(`webhooks.customfielditem_${!removed ? 'update' : 'remove'}`, {
                    member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username}?utm_source=tacobot.app)`,
                    card: `[${(0, util_1.cutoffText)(data.card.name, 25)}](https://trello.com/c/${data.card.shortLink}?utm_source=tacobot.app)`,
                    customField: (0, util_1.cutoffText)(data.customField.name, 25)
                });
                if (!added)
                    resultData.default.fields.push({
                        name: '*' + _('trello.old_v') + '*',
                        value: data.oldData.value.text,
                        inline: true
                    });
                if (!removed)
                    resultData.default.fields.push({
                        name: '*' + _('trello.new_v') + '*',
                        value: data.customFieldItem.value.text,
                        inline: true
                    });
                break;
            case 'number':
                resultData.default.title = _(`webhooks.customfielditem_${!removed ? 'update' : 'remove'}`, {
                    member: data.invoker.webhookSafeName,
                    card: (0, util_1.cutoffText)(data.card.name, 50),
                    customField: (0, util_1.cutoffText)(data.customField.name, 50)
                });
                resultData.small.description = _(`webhooks.customfielditem_${!removed ? 'update' : 'remove'}`, {
                    member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username})`,
                    card: `[${(0, util_1.cutoffText)(data.card.name, 25)}](https://trello.com/c/${data.card.shortLink})`,
                    customField: (0, util_1.cutoffText)(data.customField.name, 25)
                });
                if (!added)
                    resultData.default.fields.push({
                        name: '*' + _('trello.old_v') + '*',
                        value: _.toLocaleString(parseFloat(data.oldData.value.number)),
                        inline: true
                    });
                if (!removed)
                    resultData.default.fields.push({
                        name: '*' + _('trello.new_v') + '*',
                        value: _.toLocaleString(parseFloat(data.customFieldItem.value.number)),
                        inline: true
                    });
                break;
            case 'date':
                resultData.default.title = _(`webhooks.customfielditem_${!removed ? 'update' : 'remove'}`, {
                    member: data.invoker.webhookSafeName,
                    card: (0, util_1.cutoffText)(data.card.name, 50),
                    customField: (0, util_1.cutoffText)(data.customField.name, 50)
                });
                resultData.small.description = _(`webhooks.customfielditem_${!removed ? 'update' : 'remove'}`, {
                    member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username})`,
                    card: `[${(0, util_1.cutoffText)(data.card.name, 25)}](https://trello.com/c/${data.card.shortLink})`,
                    customField: (0, util_1.cutoffText)(data.customField.name, 25)
                });
                if (!added)
                    resultData.default.fields.push({
                        name: '*' + _('trello.old_v') + '*',
                        value: (0, util_1.formatTime)(data.oldData.value.date),
                        inline: true
                    });
                if (!removed)
                    resultData.default.fields.push({
                        name: '*' + _('trello.new_v') + '*',
                        value: (0, util_1.formatTime)(data.customFieldItem.value.date),
                        inline: true
                    });
                break;
            case 'list':
                resultData.default.title = _(`webhooks.customfielditem_${data.customFieldItem.idValue ? 'update' : 'remove'}`, {
                    member: data.invoker.webhookSafeName,
                    card: (0, util_1.cutoffText)(data.card.name, 50),
                    customField: (0, util_1.cutoffText)(data.customField.name, 50)
                });
                resultData.small.description = _(`webhooks.customfielditem_${data.customFieldItem.idValue ? 'update' : 'remove'}`, {
                    member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username})`,
                    card: `[${(0, util_1.cutoffText)(data.card.name, 25)}](https://trello.com/c/${data.card.shortLink})`,
                    customField: (0, util_1.cutoffText)(data.customField.name, 25)
                });
                break;
        }
        resultData.small.fields = resultData.default.fields;
        if (resultData.default.title)
            return data.send(resultData);
    }
};
//# sourceMappingURL=item.js.map