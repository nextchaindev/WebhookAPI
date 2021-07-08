import { EventFunction } from '../../util/events';
import { cutoffText } from '../../util';

export const event: EventFunction = {
  name: 'COPY_CHECKLIST',
  async onEvent(data) {
    const _ = data.locale;
    return data.send({
      default: {
        title: _('webhooks.copy_checklist', {
          member: data.invoker.webhookSafeName,
          sourceChecklist: cutoffText(data.sourceChecklist.name, 50),
          checklist: cutoffText(data.checklist.name, 50)
        }),
        description: data.embedDescription(['card', 'list', 'checklist'])
      },
      small: {
        description: _('webhooks.copy_checklist', {
          member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username})`,
          sourceChecklist: cutoffText(data.sourceChecklist.name, 25),
          checklist: cutoffText(data.checklist.name, 25)
        })
      }
    });
  }
};
