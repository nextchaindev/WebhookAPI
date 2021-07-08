import { EventFunction } from '../../util/events';
import { cutoffText } from '../../util';

export const event: EventFunction = {
  name: 'CREATE_LIST',
  async onEvent(data) {
    const _ = data.locale;
    return data.send({
      default: {
        title: _('webhooks.create_list', {
          member: data.invoker.webhookSafeName,
          list: cutoffText(data.list.name, 50)
        }),
        description: data.embedDescription(['list'])
      },
      small: {
        description: _('webhooks.create_list', {
          member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username})`,
          list: cutoffText(data.list.name, 25)
        })
      }
    });
  }
};
