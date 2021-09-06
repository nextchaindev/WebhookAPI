import { EventFunction } from '../../util/events';
import { cutoffText } from '../../util';

export const event: EventFunction = {
  name: 'UPDATE_CUSTOM_FIELD_ITEM',
  async onEvent(data) {
    const _ = data.locale;
    const resultData: any = {
      default: {
        description: data.embedDescription(['card', 'customField']),
        fields: []
      },
      small: {}
    };
    const added = !data.oldData.value;
    const removed = !data.customFieldItem.value;
    switch (data.customField.type) {
      case 'checkbox':
        resultData.default.title = _(`webhooks.customfielditem_checkbox_${removed}`, {
          member: data.invoker.webhookSafeName,
          card: cutoffText(data.card.name, 50),
          customField: cutoffText(data.customField.name, 50)
        });
        resultData.small.description = _(`webhooks.customfielditem_checkbox_${removed}`, {
          member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username})`,
          card: `[${cutoffText(data.card.name, 25)}](https://trello.com/c/${data.card.shortLink})`,
          customField: cutoffText(data.customField.name, 25)
        });
        break;
      case 'text':
        resultData.default.title = _(`webhooks.customfielditem_${!removed ? 'update' : 'remove'}`, {
          member: data.invoker.webhookSafeName,
          card: cutoffText(data.card.name, 50),
          customField: cutoffText(data.customField.name, 50)
        });
        resultData.small.description = _(`webhooks.customfielditem_${!removed ? 'update' : 'remove'}`, {
          member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username})`,
          card: `[${cutoffText(data.card.name, 25)}](https://trello.com/c/${data.card.shortLink})`,
          customField: cutoffText(data.customField.name, 25)
        });
        if (!removed)
          resultData.default.fields.push({
            name: '*' + _('trello.old_v') + '*',
            value: data.oldData.value.text,
            inline: true
          });
        if (!added)
          resultData.default.fields.push({
            name: '*' + _('trello.new_v') + '*',
            value: data.customFieldItem.value.text,
            inline: true
          });
        break;
      case 'number':
        resultData.default.title = _(`webhooks.customfielditem_${!removed ? 'update' : 'remove'}`, {
          member: data.invoker.webhookSafeName,
          card: cutoffText(data.card.name, 50),
          customField: cutoffText(data.customField.name, 50)
        });
        resultData.small.description = _(`webhooks.customfielditem_${!removed ? 'update' : 'remove'}`, {
          member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username})`,
          card: `[${cutoffText(data.card.name, 25)}](https://trello.com/c/${data.card.shortLink})`,
          customField: cutoffText(data.customField.name, 25)
        });
        if (!removed)
          resultData.default.fields.push({
            name: '*' + _('trello.old_v') + '*',
            value: _.toLocaleString(parseFloat(data.oldData.value.number)),
            inline: true
          });
        if (!added)
          resultData.default.fields.push({
            name: '*' + _('trello.new_v') + '*',
            value: _.toLocaleString(parseFloat(data.customFieldItem.value.number)),
            inline: true
          });
        break;
      case 'date':
        resultData.default.title = _(`webhooks.customfielditem_${!removed ? 'update' : 'remove'}`, {
          member: data.invoker.webhookSafeName,
          card: cutoffText(data.card.name, 50),
          customField: cutoffText(data.customField.name, 50)
        });
        resultData.small.description = _(`webhooks.customfielditem_${!removed ? 'update' : 'remove'}`, {
          member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username})`,
          card: `[${cutoffText(data.card.name, 25)}](https://trello.com/c/${data.card.shortLink})`,
          customField: cutoffText(data.customField.name, 25)
        });
        if (!removed)
          resultData.default.fields.push({
            name: '*' + _('trello.old_v') + '*',
            value: _.moment(data.oldData.value.date).format('LLLL'),
            inline: true
          });
        if (!added)
          resultData.default.fields.push({
            name: '*' + _('trello.new_v') + '*',
            value: _.moment(data.customFieldItem.value.date).format('LLLL'),
            inline: true
          });
        break;
      case 'list':
        resultData.default.title = _(
          `webhooks.customfielditem_${data.oldData.idValue ? 'update' : 'remove'}`,
          {
            member: data.invoker.webhookSafeName,
            card: cutoffText(data.card.name, 50),
            customField: cutoffText(data.customField.name, 50)
          }
        );
        resultData.small.description = _(
          `webhooks.customfielditem_${data.oldData.idValue ? 'update' : 'remove'}`,
          {
            member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username})`,
            card: `[${cutoffText(data.card.name, 25)}](https://trello.com/c/${data.card.shortLink})`,
            customField: cutoffText(data.customField.name, 25)
          }
        );
        break;
    }
    resultData.small.fields = resultData.default.fields;
    if (resultData.default.title) return data.send(resultData);
  }
};
