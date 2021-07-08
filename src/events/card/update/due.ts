import { EventFunction } from '../../../util/events';
import { cutoffText } from '../../../util';

export const event: EventFunction = {
  name: 'UPDATE_CARD_DUE',
  async onEvent(data) {
    const _ = data.locale;
    const changedKey = Object.keys(data.oldData)[0];
    if (changedKey === 'due') {
      const title = !data.oldData.due
        ? 'webhooks.due_add'
        : !data.card.due
        ? 'webhooks.due_remove'
        : 'webhooks.due_change';
      const oldDue = _.moment(data.oldData.due);
      const newDue = _.moment(data.card.due);
      return data.send({
        default: {
          title: _(title, {
            member: data.invoker.webhookSafeName,
            card: cutoffText(data.card.name, 50)
          }),
          description: data.embedDescription(['card', 'list']),
          fields: [
            data.oldData.due
              ? {
                  name: '*' + _('trello.old_due') + '*',
                  value: `${oldDue.format('LLLL')} *(${oldDue.fromNow()})*`,
                  inline: true
                }
              : null,
            data.card.due
              ? {
                  name: '*' + _('trello.new_due') + '*',
                  value: `${newDue.format('LLLL')} *(${newDue.fromNow()})*`,
                  inline: true
                }
              : null
          ].filter((v) => !!v)
        },
        small: {
          description: _(title, {
            member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username})`,
            card: `[${cutoffText(data.card.name, 25)}](https://trello.com/c/${data.card.shortLink})`
          }),
          fields: [
            data.oldData.due
              ? {
                  name: '*' + _('trello.old_due') + '*',
                  value: `${oldDue.format('LLLL')} *(${oldDue.fromNow()})*`,
                  inline: true
                }
              : null,
            data.card.due
              ? {
                  name: '*' + _('trello.new_due') + '*',
                  value: `${newDue.format('LLLL')} *(${newDue.fromNow()})*`,
                  inline: true
                }
              : null
          ].filter((v) => !!v)
        }
      });
    } else if (changedKey === 'dueComplete')
      return data.send({
        default: {
          title: _(data.card.dueComplete ? 'webhooks.due_on' : 'webhooks.due_off', {
            member: data.invoker.webhookSafeName,
            card: cutoffText(data.card.name, 50)
          }),
          description: data.embedDescription(['card', 'list'])
        },
        small: {
          description: _(data.card.dueComplete ? 'webhooks.due_on' : 'webhooks.due_off', {
            member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username})`,
            card: `[${cutoffText(data.card.name, 25)}](https://trello.com/c/${data.card.shortLink})`
          })
        }
      });
  }
};
